export interface BookChapter {
  id: string
  title: string
  file: string
  type: 'foreword' | 'preface' | 'chapter' | 'appendix'
}

export interface Book {
  id: string
  slug: string
  title: string
  shortTitle: string
  order: number
  description: string
  chapters: BookChapter[]
  color: string
}

export interface ReadingProgress {
  bookSlug: string
  chapterId: string
  scrollPercent: number
  lastRead: number
}

export interface ConsoleEntry {
  id: number
  type: 'input' | 'output' | 'error'
  content: string
}

export type ThemeMode = 'dark' | 'light'
