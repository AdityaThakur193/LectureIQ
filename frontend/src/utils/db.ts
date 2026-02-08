/**
 * IndexedDB utility for storing lecture data locally in the browser
 */

const DB_NAME = 'LectureIQ'
const DB_VERSION = 1
const STORE_NAME = 'lectures'

export interface Lecture {
  id: string
  title: string
  status: 'processing' | 'completed' | 'failed'
  transcript?: string
  notes?: string
  flashcards?: Array<{ question: string; answer: string; difficulty?: string }>
  quiz?: Array<{ 
    question: string
    options: string[]
    correct_answer: number
    explanation?: string
  }>
  videoUrl?: string
  slidesUrl?: string
  createdAt: string
  error?: string
}

class LectureDB {
  private db: IDBDatabase | null = null

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          objectStore.createIndex('createdAt', 'createdAt', { unique: false })
          objectStore.createIndex('status', 'status', { unique: false })
        }
      }
    })
  }

  /**
   * Save a lecture to the database
   */
  async saveLecture(lecture: Lecture): Promise<void> {
    // Ensure DB is initialized before saving
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(lecture)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get a lecture by ID
   */
  async getLecture(id: string): Promise<Lecture | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get all lectures sorted by creation date (newest first)
   */
  async getAllLectures(): Promise<Lecture[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        const lectures = request.result || []
        // Sort by creation date, newest first
        lectures.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        resolve(lectures)
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Delete a lecture by ID
   */
  async deleteLecture(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Search lectures by title
   */
  async searchLectures(searchTerm: string): Promise<Lecture[]> {
    const allLectures = await this.getAllLectures()
    const term = searchTerm.toLowerCase()
    
    return allLectures.filter(lecture => 
      lecture.title.toLowerCase().includes(term)
    )
  }

  /**
   * Get lectures by status
   */
  async getLecturesByStatus(status: Lecture['status']): Promise<Lecture[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('status')
      const request = index.getAll(status)

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Clear all lectures (for testing/reset)
   */
  async clearAll(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Export all lectures as JSON (for backup)
   */
  async exportToJSON(): Promise<string> {
    const lectures = await this.getAllLectures()
    return JSON.stringify(lectures, null, 2)
  }

  /**
   * Import lectures from JSON (for restore)
   */
  async importFromJSON(jsonString: string): Promise<void> {
    const lectures = JSON.parse(jsonString) as Lecture[]
    
    for (const lecture of lectures) {
      await this.saveLecture(lecture)
    }
  }
}

// Export singleton instance
export const lectureDB = new LectureDB()
