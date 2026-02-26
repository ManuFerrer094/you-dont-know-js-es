import type { Book } from '@/types/book'

export const BOOKS: Book[] = [
  {
    id: 'up-going',
    slug: 'up-going',
    title: 'Up & Going',
    shortTitle: 'Up & Going',
    order: 1,
    description:
      'Start your journey into JavaScript. Learn the basics of programming & the core mechanisms of JS.',
    color: '#FFD600',
    chapters: [
      { id: 'foreword', title: 'Foreword', file: 'foreword.md', type: 'foreword' },
      { id: 'ch1', title: 'Into Programming', file: 'ch1.md', type: 'chapter' },
      { id: 'ch2', title: 'Into JavaScript', file: 'ch2.md', type: 'chapter' },
      { id: 'ch3', title: 'Into YDKJS', file: 'ch3.md', type: 'chapter' },
      { id: 'apA', title: 'Acknowledgments', file: 'apA.md', type: 'appendix' },
    ],
  },
  {
    id: 'scope-closures',
    slug: 'scope-closures',
    title: 'Scope & Closures',
    shortTitle: 'Scope & Closures',
    order: 2,
    description:
      'Understand lexical scope, closures, modules, and the scope chain that governs variable access.',
    color: '#FF6B35',
    chapters: [
      { id: 'foreword', title: 'Foreword', file: 'foreword.md', type: 'foreword' },
      { id: 'ch1', title: 'What is Scope?', file: 'ch1.md', type: 'chapter' },
      { id: 'ch2', title: 'Lexical Scope', file: 'ch2.md', type: 'chapter' },
      { id: 'ch3', title: 'Function vs. Block Scope', file: 'ch3.md', type: 'chapter' },
      { id: 'ch4', title: 'Hoisting', file: 'ch4.md', type: 'chapter' },
      { id: 'ch5', title: 'Scope Closures', file: 'ch5.md', type: 'chapter' },
      { id: 'apA', title: 'Dynamic Scope', file: 'apA.md', type: 'appendix' },
      { id: 'apB', title: 'Polyfilling Block Scope', file: 'apB.md', type: 'appendix' },
      { id: 'apC', title: 'Lexical-this', file: 'apC.md', type: 'appendix' },
      { id: 'apD', title: 'Acknowledgments', file: 'apD.md', type: 'appendix' },
    ],
  },
  {
    id: 'this-object-prototypes',
    slug: 'this-object-prototypes',
    title: 'this & Object Prototypes',
    shortTitle: 'this & Prototypes',
    order: 3,
    description:
      'Demystify the this keyword, object mechanics, prototypal inheritance, and behavior delegation.',
    color: '#4ECDC4',
    chapters: [
      { id: 'foreword', title: 'Foreword', file: 'foreword.md', type: 'foreword' },
      { id: 'ch1', title: 'this Or That?', file: 'ch1.md', type: 'chapter' },
      { id: 'ch2', title: 'this All Makes Sense Now!', file: 'ch2.md', type: 'chapter' },
      { id: 'ch3', title: 'Objects', file: 'ch3.md', type: 'chapter' },
      { id: 'ch4', title: 'Mixing (Up) "Class" Objects', file: 'ch4.md', type: 'chapter' },
      { id: 'ch5', title: 'Prototypes', file: 'ch5.md', type: 'chapter' },
      { id: 'ch6', title: 'Behavior Delegation', file: 'ch6.md', type: 'chapter' },
      { id: 'apA', title: 'ES6 class', file: 'apA.md', type: 'appendix' },
      { id: 'apB', title: 'Acknowledgments', file: 'apB.md', type: 'appendix' },
    ],
  },
  {
    id: 'types-grammar',
    slug: 'types-grammar',
    title: 'Types & Grammar',
    shortTitle: 'Types & Grammar',
    order: 4,
    description:
      'Explore the type system, coercion, natives, and the grammar rules that every JS dev should know.',
    color: '#A78BFA',
    chapters: [
      { id: 'foreword', title: 'Foreword', file: 'foreword.md', type: 'foreword' },
      { id: 'ch1', title: 'Types', file: 'ch1.md', type: 'chapter' },
      { id: 'ch2', title: 'Values', file: 'ch2.md', type: 'chapter' },
      { id: 'ch3', title: 'Natives', file: 'ch3.md', type: 'chapter' },
      { id: 'ch4', title: 'Coercion', file: 'ch4.md', type: 'chapter' },
      { id: 'ch5', title: 'Grammar', file: 'ch5.md', type: 'chapter' },
      { id: 'apA', title: 'Mixed Environment JavaScript', file: 'apA.md', type: 'appendix' },
      { id: 'apB', title: 'Acknowledgments', file: 'apB.md', type: 'appendix' },
    ],
  },
  {
    id: 'async-performance',
    slug: 'async-performance',
    title: 'Async & Performance',
    shortTitle: 'Async & Perf',
    order: 5,
    description:
      'Master asynchrony with callbacks, promises, generators, and learn performance optimization.',
    color: '#F472B6',
    chapters: [
      { id: 'foreword', title: 'Foreword', file: 'foreword.md', type: 'foreword' },
      { id: 'ch1', title: 'Asynchrony: Now & Later', file: 'ch1.md', type: 'chapter' },
      { id: 'ch2', title: 'Callbacks', file: 'ch2.md', type: 'chapter' },
      { id: 'ch3', title: 'Promises', file: 'ch3.md', type: 'chapter' },
      { id: 'ch4', title: 'Generators', file: 'ch4.md', type: 'chapter' },
      { id: 'ch5', title: 'Program Performance', file: 'ch5.md', type: 'chapter' },
      { id: 'ch6', title: 'Benchmarking & Tuning', file: 'ch6.md', type: 'chapter' },
      { id: 'apA', title: 'asynquence Library', file: 'apA.md', type: 'appendix' },
      { id: 'apB', title: 'Advanced Async Patterns', file: 'apB.md', type: 'appendix' },
      { id: 'apC', title: 'Acknowledgments', file: 'apC.md', type: 'appendix' },
    ],
  },
  {
    id: 'es6-beyond',
    slug: 'es6-beyond',
    title: 'ES6 & Beyond',
    shortTitle: 'ES6 & Beyond',
    order: 6,
    description:
      'Explore the new features of ES6+: destructuring, classes, modules, proxies, and more.',
    color: '#34D399',
    chapters: [
      { id: 'foreword', title: 'Foreword', file: 'foreword.md', type: 'foreword' },
      { id: 'ch1', title: 'ES? Now & Future', file: 'ch1.md', type: 'chapter' },
      { id: 'ch2', title: 'Syntax', file: 'ch2.md', type: 'chapter' },
      { id: 'ch3', title: 'Organization', file: 'ch3.md', type: 'chapter' },
      { id: 'ch4', title: 'Async Flow Control', file: 'ch4.md', type: 'chapter' },
      { id: 'ch5', title: 'Collections', file: 'ch5.md', type: 'chapter' },
      { id: 'ch6', title: 'API Additions', file: 'ch6.md', type: 'chapter' },
      { id: 'ch7', title: 'Meta Programming', file: 'ch7.md', type: 'chapter' },
      { id: 'ch8', title: 'Beyond ES6', file: 'ch8.md', type: 'chapter' },
      { id: 'apA', title: 'Acknowledgments', file: 'apA.md', type: 'appendix' },
    ],
  },
]

/** Map book slug to the actual folder name inside texts/ */
const FOLDER_MAP: Record<string, string> = {
  'up-going': 'up & going',
  'scope-closures': 'scope & closures',
  'this-object-prototypes': 'this & object prototypes',
  'types-grammar': 'types & grammar',
  'async-performance': 'async & performance',
  'es6-beyond': 'es6 & beyond',
}

/**
 * All markdown files lazily loaded at build time via Vite glob import.
 * Keys are like "/texts/up & going/ch1.md" → () => Promise<string>.
 */
const markdownModules = import.meta.glob<string>(
  [
    '/texts/up & going/*.md',
    '/texts/scope & closures/*.md',
    '/texts/this & object prototypes/*.md',
    '/texts/types & grammar/*.md',
    '/texts/async & performance/*.md',
    '/texts/es6 & beyond/*.md',
    '/preface.md',
  ],
  { query: '?raw', import: 'default', eager: false },
)

export function getBookBySlug(slug: string): Book | undefined {
  return BOOKS.find((b) => b.slug === slug)
}

export async function getChapterContent(bookSlug: string, chapterId: string): Promise<string | null> {
  const folder = FOLDER_MAP[bookSlug]
  if (!folder) return null

  const book = getBookBySlug(bookSlug)
  if (!book) return null

  const chapter = book.chapters.find((c) => c.id === chapterId)
  if (!chapter) return null

  const key = `/texts/${folder}/${chapter.file}`
  const loader = markdownModules[key]
  if (!loader) return null

  return loader()
}

export async function getPrefaceContent(): Promise<string | null> {
  const loader = markdownModules['/preface.md']
  if (!loader) return null
  return loader()
}

export function getNextChapter(
  bookSlug: string,
  chapterId: string,
): { bookSlug: string; chapterId: string; bookTitle: string; chapterTitle: string } | null {
  const book = getBookBySlug(bookSlug)
  if (!book) return null

  const idx = book.chapters.findIndex((c) => c.id === chapterId)
  if (idx < book.chapters.length - 1) {
    const next = book.chapters[idx + 1]!
    return { bookSlug, chapterId: next.id, bookTitle: book.title, chapterTitle: next.title }
  }

  // Move to next book
  const nextBook = BOOKS.find((b) => b.order === book.order + 1)
  if (nextBook && nextBook.chapters.length > 0) {
    const first = nextBook.chapters[0]!
    return {
      bookSlug: nextBook.slug,
      chapterId: first.id,
      bookTitle: nextBook.title,
      chapterTitle: first.title,
    }
  }
  return null
}

export function getPrevChapter(
  bookSlug: string,
  chapterId: string,
): { bookSlug: string; chapterId: string; bookTitle: string; chapterTitle: string } | null {
  const book = getBookBySlug(bookSlug)
  if (!book) return null

  const idx = book.chapters.findIndex((c) => c.id === chapterId)
  if (idx > 0) {
    const prev = book.chapters[idx - 1]!
    return { bookSlug, chapterId: prev.id, bookTitle: book.title, chapterTitle: prev.title }
  }

  // Move to previous book
  const prevBook = BOOKS.find((b) => b.order === book.order - 1)
  if (prevBook && prevBook.chapters.length > 0) {
    const last = prevBook.chapters[prevBook.chapters.length - 1]!
    return {
      bookSlug: prevBook.slug,
      chapterId: last.id,
      bookTitle: prevBook.title,
      chapterTitle: last.title,
    }
  }
  return null
}
