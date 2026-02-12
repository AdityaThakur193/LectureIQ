/// <reference types="vite/client" />

import { lectureDB, type Lecture } from '../utils/db'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const HEALTH_CHECK_TIMEOUT = 10000 // 10 seconds for health check

export interface UploadResponse {
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

export interface ProgressCallback {
  (stage: 'waking' | 'uploading' | 'processing', progress?: number): void
}

/**
 * Check if server is available
 */
async function checkServerConnection(onProgress?: ProgressCallback): Promise<boolean> {
  try {
    onProgress?.('waking', 50)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT)
    
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (response.ok) {
      onProgress?.('waking', 100)
      return true
    }
    return false
  } catch (error) {
    console.error('Server connection check failed:', error)
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
      lecture to backend for processing, then save to IndexedDB
 */
export async function uploadAndProcessLecture(
  title: string,
  video: File,
  slides?: File,
  onProgress?: ProgressCallback
): Promise<Lecture> {
  // Step 1: Check server connection
  onProgress?.('waking', 0)
  const serverAvailable = await checkServerConnection(onProgress)
  
  if (!serverAvailable) {
    throw new Error('Unable to connect to server. Please check your connection and try again.')
  }
  
  // Step 2: Upload and process
  const formData = new FormData()
  formData.append('title', title)
  formData.append('video', video)
  if (slides) formData.append('slides', slides)

  onProgress?.('uploading', 50)
  
  const response = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' }))
    throw new Error(error.detail || 'Upload failed')
  }

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
