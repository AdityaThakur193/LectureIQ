/// <reference types="vite/client" />

import { lectureDB, type Lecture } from '../utils/db'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const WAKE_UP_TIMEOUT = 60000 // 60 seconds for server to wake up
const HEALTH_CHECK_RETRIES = 5
const RETRY_DELAY = 3000 // 3 seconds between retries

export interface UploadResponse {
  lecture_id: string
  status: 'processing' | 'completed' | 'failed'
  message: string
  status_url?: string
  transcript?: string
  notes?: string
  flashcards?: Array<{ question: string; answer: string; difficulty?: string }>
  quiz?: Array<{ 
    question: string
    options: string[]
    correct_answer: number
    explanation?: string
  }>
  error?: string
  result?: {
    lecture_id: string
    status: 'processing' | 'completed' | 'failed'
    message: string
    transcript?: string
    notes?: string
    flashcards?: Array<{ question: string; answer: string; difficulty?: string }>
    quiz?: Array<{ 
      question: string
      options: string[]
      correct_answer: number
      explanation?: string
    }>
    error?: string
  }
}

export interface ProgressCallback {
  (stage: 'waking' | 'uploading' | 'processing', progress?: number): void
}

/**
 * Wake up the backend server if it's sleeping
 */
async function wakeUpServer(onProgress?: ProgressCallback): Promise<boolean> {
  const startTime = Date.now()
  let attempts = 0
  
  while (attempts < HEALTH_CHECK_RETRIES) {
    try {
      attempts++
      onProgress?.('waking', (attempts / HEALTH_CHECK_RETRIES) * 100)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), WAKE_UP_TIMEOUT)
      
      const response = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        console.log(`Server woke up in ${Date.now() - startTime}ms`)
        // Wait for server to stabilize before proceeding
        await new Promise(resolve => setTimeout(resolve, 1500))
        return true
      }
    } catch (error) {
      console.log(`Wake-up attempt ${attempts} failed:`, error)
      
      if (attempts < HEALTH_CHECK_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      }
    }
  }
  
  return false
}

/**
 * Upload with retry logic
 */
async function uploadWithRetry(
  formData: FormData,
  onProgress?: ProgressCallback,
  retries: number = 4
): Promise<Response> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      onProgress?.('uploading', ((attempt + 1) / (retries + 1)) * 50)
      
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        return response
      }
      
      // If server returned an error, don't retry
      if (response.status >= 400 && response.status < 500) {
        return response
      }
      
      throw new Error(`Upload failed with status ${response.status}`)
    } catch (error) {
      lastError = error as Error
      
      if (attempt < retries) {
        console.log(`Upload attempt ${attempt + 1} failed, retrying...`)
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      }
    }
  }
  
  throw lastError || new Error('Upload failed')
}

/**
 * Poll the status endpoint until processing is complete
 */
async function pollProcessingStatus(
  lectureId: string,
  onProgress?: ProgressCallback,
  maxAttempts: number = 120, // 10 minutes max (5 seconds * 120)
  pollInterval: number = 5000 // 5 seconds
): Promise<UploadResponse> {
  let attempts = 0
  
  while (attempts < maxAttempts) {
    try {
      attempts++
      const response = await fetch(`${API_BASE}/api/status/${lectureId}`)
      
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`)
      }
      
      const statusData = await response.json()
      
      // Update progress (show we're still processing)
      onProgress?.('processing', Math.min((attempts / maxAttempts) * 100, 95))
      
      if (statusData.status === 'completed' || statusData.status === 'failed') {
        // Processing complete, return the result
        return statusData.result || statusData
      }
      
      // Still processing, wait before checking again
      await new Promise(resolve => setTimeout(resolve, pollInterval))
      
    } catch (error) {
      console.error(`Status check attempt ${attempts} failed:`, error)
      
      if (attempts >= maxAttempts) {
        throw new Error('Processing timed out. Please check your lectures page.')
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }
  }
  
  throw new Error('Processing timed out')
}

/**
 * Upload lecture to backend for processing, then save to IndexedDB
 */
export async function uploadAndProcessLecture(
  title: string,
  video: File,
  slides?: File,
  onProgress?: ProgressCallback
): Promise<Lecture> {
  // Step 1: Wake up server if needed
  onProgress?.('waking', 0)
  const serverAwake = await wakeUpServer(onProgress)
  
  if (!serverAwake) {
    throw new Error('Unable to connect to server. Please check your internet connection and try again.')
  }
  
  // Step 2: Prepare and upload files
  const formData = new FormData()
  formData.append('title', title)
  formData.append('video', video)
  if (slides) formData.append('slides', slides)

  onProgress?.('uploading', 0)
  const response = await uploadWithRetry(formData, onProgress)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Upload failed')
  }

  // Step 3: Processing
  onProgress?.('processing', 0)
  const uploadResult: UploadResponse = await response.json()

  // Check if we need to poll for completion
  let result: UploadResponse
  if (uploadResult.status === 'processing') {
    // Backend is processing asynchronously, poll for completion
    result = await pollProcessingStatus(uploadResult.lecture_id, onProgress)
  } else {
    // Processing already complete (shouldn't happen with new backend, but handle it)
    result = uploadResult
  }

  onProgress?.('processing', 100)

  // Create lecture object from the final result
  const lecture: Lecture = {
    id: result.lecture_id,
    title: title,
    status: result.status,
    transcript: result.transcript,
    notes: result.notes,
    flashcards: result.flashcards,
    quiz: result.quiz,
    error: result.error,
    createdAt: new Date().toISOString(),
  }

  // Save to IndexedDB
  await lectureDB.saveLecture(lecture)

  return lecture
}

/**
 * Get lecture from IndexedDB
 */
export async function getLecture(id: string): Promise<Lecture | null> {
  return await lectureDB.getLecture(id)
}

/**
 * Get all lectures from IndexedDB
 */
export async function getAllLectures(): Promise<Lecture[]> {
  return await lectureDB.getAllLectures()
}

/**
 * Delete lecture from IndexedDB
 */
export async function deleteLecture(id: string): Promise<void> {
  await lectureDB.deleteLecture(id)
}

/**
 * Search lectures in IndexedDB
 */
export async function searchLectures(searchTerm: string): Promise<Lecture[]> {
  return await lectureDB.searchLectures(searchTerm)
}

/**
 * Export all lectures as JSON
 */
export async function exportLectures(): Promise<string> {
  return await lectureDB.exportToJSON()
}

/**
 * Import lectures from JSON
 */
export async function importLectures(jsonString: string): Promise<void> {
  await lectureDB.importFromJSON(jsonString)
}
