/// <reference types="vite/client" />

import { lectureDB, type Lecture } from '../utils/db'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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

/**
 * Upload lecture to backend for processing, then save to IndexedDB
 */
export async function uploadAndProcessLecture(
  title: string,
  video: File,
  slides?: File
): Promise<Lecture> {
  const formData = new FormData()
  formData.append('title', title)
  formData.append('video', video)
  if (slides) formData.append('slides', slides)

  // Send to backend for processing
  const response = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Upload failed')
  }

  const result: UploadResponse = await response.json()

  // Create lecture object
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
