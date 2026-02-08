import { create } from 'zustand'
import { lectureDB, type Lecture } from '../utils/db'

interface LectureStore {
  lectures: Lecture[]
  currentLecture: Lecture | null
  isLoading: boolean
  error: string | null
  
  // Actions
  loadLectures: () => Promise<void>
  loadLecture: (id: string) => Promise<void>
  saveLecture: (lecture: Lecture) => Promise<void>
  deleteLecture: (id: string) => Promise<void>
  searchLectures: (searchTerm: string) => Promise<void>
  setCurrentLecture: (lecture: Lecture | null) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useLectureStore = create<LectureStore>((set, get) => ({
  lectures: [],
  currentLecture: null,
  isLoading: false,
  error: null,

  loadLectures: async () => {
    set({ isLoading: true, error: null })
    try {
      const lectures = await lectureDB.getAllLectures()
      set({ lectures, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load lectures',
        isLoading: false 
      })
    }
  },

  loadLecture: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const lecture = await lectureDB.getLecture(id)
      set({ currentLecture: lecture, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load lecture',
        isLoading: false 
      })
    }
  },

  saveLecture: async (lecture: Lecture) => {
    set({ isLoading: true, error: null })
    try {
      await lectureDB.saveLecture(lecture)
      
      // Update lectures list
      const lectures = get().lectures
      const index = lectures.findIndex(l => l.id === lecture.id)
      if (index >= 0) {
        lectures[index] = lecture
      } else {
        lectures.unshift(lecture) // Add to beginning
      }
      
      set({ lectures: [...lectures], isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save lecture',
        isLoading: false 
      })
    }
  },

  deleteLecture: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await lectureDB.deleteLecture(id)
      const lectures = get().lectures.filter(l => l.id !== id)
      set({ lectures, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete lecture',
        isLoading: false 
      })
    }
  },

  searchLectures: async (searchTerm: string) => {
    set({ isLoading: true, error: null })
    try {
      const lectures = searchTerm 
        ? await lectureDB.searchLectures(searchTerm)
        : await lectureDB.getAllLectures()
      set({ lectures, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to search lectures',
        isLoading: false 
      })
    }
  },

  setCurrentLecture: (lecture: Lecture | null) => {
    set({ currentLecture: lecture })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  clearError: () => {
    set({ error: null })
  },
}))
