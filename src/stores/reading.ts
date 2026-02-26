import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ReadingProgress } from '@/types/book'
import { BOOKS } from '@/data/books'

const STORAGE_KEY = 'ydkjs-reading-progress'

export const useReadingStore = defineStore('reading', () => {
  // State
  const progressMap = ref<Record<string, ReadingProgress>>(loadProgress())
  const sidebarOpen = ref(true)
  const consoleOpen = ref(true)

  // Getters
  const totalChapters = computed(() =>
    BOOKS.reduce((sum, book) => sum + book.chapters.length, 0),
  )

  const completedChapters = computed(() => {
    return Object.values(progressMap.value).filter((p) => p.scrollPercent >= 90).length
  })

  const overallProgress = computed(() => {
    if (totalChapters.value === 0) return 0
    return Math.round((completedChapters.value / totalChapters.value) * 100)
  })

  function bookProgress(bookSlug: string): number {
    const book = BOOKS.find((b) => b.slug === bookSlug)
    if (!book) return 0
    const completed = book.chapters.filter((ch) => {
      const key = `${bookSlug}/${ch.id}`
      const p = progressMap.value[key]
      return p && p.scrollPercent >= 90
    }).length
    return Math.round((completed / book.chapters.length) * 100)
  }

  function chapterProgress(bookSlug: string, chapterId: string): number {
    const key = `${bookSlug}/${chapterId}`
    return progressMap.value[key]?.scrollPercent ?? 0
  }

  function isChapterRead(bookSlug: string, chapterId: string): boolean {
    return chapterProgress(bookSlug, chapterId) >= 90
  }

  // Actions
  function updateProgress(bookSlug: string, chapterId: string, scrollPercent: number): void {
    const key = `${bookSlug}/${chapterId}`
    const existing = progressMap.value[key]

    // Only update if higher progress
    if (existing && existing.scrollPercent >= scrollPercent) {
      progressMap.value[key] = { ...existing, lastRead: Date.now() }
    } else {
      progressMap.value[key] = {
        bookSlug,
        chapterId,
        scrollPercent,
        lastRead: Date.now(),
      }
    }
    saveProgress()
  }

  function toggleSidebar(): void {
    sidebarOpen.value = !sidebarOpen.value
  }

  function toggleConsole(): void {
    consoleOpen.value = !consoleOpen.value
  }

  function getLastRead(): { bookSlug: string; chapterId: string } | null {
    const entries = Object.values(progressMap.value)
    if (entries.length === 0) return null
    const sorted = entries.sort((a, b) => b.lastRead - a.lastRead)
    const latest = sorted[0]!
    return { bookSlug: latest.bookSlug, chapterId: latest.chapterId }
  }

  return {
    progressMap,
    sidebarOpen,
    consoleOpen,
    totalChapters,
    completedChapters,
    overallProgress,
    bookProgress,
    chapterProgress,
    isChapterRead,
    updateProgress,
    toggleSidebar,
    toggleConsole,
    getLastRead,
  }
})

function loadProgress(): Record<string, ReadingProgress> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as Record<string, ReadingProgress>) : {}
  } catch {
    return {}
  }
}

function saveProgress(): void {
  const store = useReadingStore()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store.progressMap))
}
