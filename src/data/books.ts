import type { Book } from '@/types/book'

export const BOOKS: Book[] = [
  {
    id: 'up-going',
    slug: 'up-going',
    title: 'Arriba y Andando',
    shortTitle: 'Arriba y Andando',
    order: 1,
    description:
      'Comienza tu viaje en JavaScript. Aprende los fundamentos de la programación y los mecanismos básicos de JS.',
    color: '#FFD600',
    chapters: [
      { id: 'foreword', title: 'Prólogo', files: ['foreword.md'], type: 'foreword' },
      { id: 'ch1', title: 'Introducción a la Programación', files: ['ch1.md'], type: 'chapter' },
      { id: 'ch2', title: 'Introducción a JavaScript', files: ['ch2.md'], type: 'chapter' },
      { id: 'ch3', title: 'Introducción a YDKJS', files: ['ch3.md'], type: 'chapter' },
      { id: 'apA', title: 'Agradecimientos', files: ['apA.md'], type: 'appendix' },
    ],
  },
  {
    id: 'scope-closures',
    slug: 'scope-closures',
    title: 'Scope y Closures',
    shortTitle: 'Scope y Closures',
    order: 2,
    description:
      'Comprende el scope léxico, los closures, los módulos y la cadena de scope que gobierna el acceso a variables.',
    color: '#FF6B35',
    chapters: [
      { id: 'ch1', title: '¿Qué es el Scope?', files: ['ch1.md'], type: 'chapter' },
      { id: 'ch2', title: 'Scope Léxico', files: ['ch2.md'], type: 'chapter' },
      { id: 'ch3', title: 'Scope de Función vs. de Bloque', files: ['ch3.md'], type: 'chapter' },
      { id: 'ch4', title: 'Hoisting', files: ['ch4.md'], type: 'chapter' },
      { id: 'ch5', title: 'Scope y Closures', files: ['ch5.md'], type: 'chapter' },
      { id: 'apA', title: 'Scope Dinámico', files: ['apA.md'], type: 'appendix' },
      { id: 'apB', title: 'Polyfilling del Scope de Bloque', files: ['apB.md'], type: 'appendix' },
      { id: 'apC', title: '`this` Léxico', files: ['apC.md'], type: 'appendix' },
      { id: 'apD', title: 'Agradecimientos', files: ['apD.md'], type: 'appendix' },
    ],
  },
  {
    id: 'this-object-prototypes',
    slug: 'this-object-prototypes',
    title: 'this y Prototipos de Objetos',
    shortTitle: 'this y Prototipos',
    order: 3,
    description:
      'Desmitifica la palabra clave this, la mecánica de objetos, la herencia prototípica y la delegación de comportamiento.',
    color: '#4ECDC4',
    chapters: [
      { id: 'foreword', title: 'Prólogo', files: ['foreword.md'], type: 'foreword' },
      { id: 'ch1', title: '¿`this` O Eso?', files: ['ch1.md'], type: 'chapter' },
      { id: 'ch2', title: '¡`this` Ahora Todo Tiene Sentido!', files: ['ch2-1.md', 'ch2-2.md'], type: 'chapter' },
      { id: 'ch3', title: 'Objetos', files: ['ch3-1.md', 'ch3-2.md'], type: 'chapter' },
      { id: 'ch4', title: 'Mezclando Objetos "Clase"', files: ['ch4.md'], type: 'chapter' },
      { id: 'ch5', title: 'Prototipos', files: ['ch5-1.md', 'ch5-2.md'], type: 'chapter' },
      { id: 'ch6', title: 'Delegación de Comportamiento', files: ['ch6-1.md', 'ch6-2.md'], type: 'chapter' },
      { id: 'apA', title: '`class` en ES6', files: ['apA.md'], type: 'appendix' },
      { id: 'apB', title: 'Agradecimientos', files: ['apB.md'], type: 'appendix' },
    ],
  },
  {
    id: 'types-grammar',
    slug: 'types-grammar',
    title: 'Tipos y Gramática',
    shortTitle: 'Tipos y Gramática',
    order: 4,
    description:
      'Explora el sistema de tipos, la coerción, los nativos y las reglas gramaticales que todo desarrollador JS debe conocer.',
    color: '#A78BFA',
    chapters: [
      { id: 'foreword', title: 'Prólogo', files: ['foreword.md'], type: 'foreword' },
      { id: 'ch1', title: 'Tipos', files: ['ch1.md'], type: 'chapter' },
      { id: 'ch2', title: 'Valores', files: ['ch2-1.md', 'ch2-2.md'], type: 'chapter' },
      { id: 'ch3', title: 'Nativos', files: ['ch3.md'], type: 'chapter' },
      { id: 'ch4', title: 'Coerción', files: ['ch4-1.md', 'ch4-2.md', 'ch4-3.md'], type: 'chapter' },
      { id: 'ch5', title: 'Gramática', files: ['ch5-1.md', 'ch5-2.md'], type: 'chapter' },
      { id: 'apA', title: 'JavaScript en Entornos Mixtos', files: ['apA.md'], type: 'appendix' },
      { id: 'apB', title: 'Agradecimientos', files: ['apB.md'], type: 'appendix' },
    ],
  },
  {
    id: 'async-performance',
    slug: 'async-performance',
    title: 'Async y Rendimiento',
    shortTitle: 'Async y Rend.',
    order: 5,
    description:
      'Domina la asincronía con callbacks, promesas, generadores y aprende optimización del rendimiento.',
    color: '#F472B6',
    chapters: [
      { id: 'foreword', title: 'Prólogo', files: ['foreword.md'], type: 'foreword' },
      { id: 'ch1', title: 'Asincronía: Ahora y Después', files: ['ch1.md'], type: 'chapter' },
      { id: 'ch2', title: 'Callbacks', files: ['ch2.md'], type: 'chapter' },
      { id: 'ch3', title: 'Promesas', files: ['ch3-1.md', 'ch3-2.md', 'ch3-3.md'], type: 'chapter' },
      { id: 'ch4', title: 'Generadores', files: ['ch4-1.md', 'ch4-2.md', 'ch4-3.md'], type: 'chapter' },
      { id: 'ch5', title: 'Rendimiento del Programa', files: ['ch5.md'], type: 'chapter' },
      { id: 'ch6', title: 'Benchmarking y Optimización', files: ['ch6.md'], type: 'chapter' },
      { id: 'apA', title: 'Biblioteca asynquence', files: ['apA-1.md', 'apA-2.md'], type: 'appendix' },
      { id: 'apB', title: 'Patrones Asíncronos Avanzados', files: ['apB-1.md', 'apB-2.md'], type: 'appendix' },
      { id: 'apC', title: 'Agradecimientos', files: ['apC.md'], type: 'appendix' },
    ],
  },
  {
    id: 'es6-beyond',
    slug: 'es6-beyond',
    title: 'ES6 y Más Allá',
    shortTitle: 'ES6 y Más Allá',
    order: 6,
    description:
      'Explora las nuevas características de ES6+: desestructuración, clases, módulos, proxies y más.',
    color: '#34D399',
    chapters: [
      { id: 'foreword', title: 'Prólogo', files: ['foreword.md'], type: 'foreword' },
      { id: 'ch1', title: '¿ES? Ahora y Futuro', files: ['ch1.md'], type: 'chapter' },
      { id: 'ch2', title: 'Sintaxis', files: ['ch2-1.md', 'ch2-2.md', 'ch2-3.md', 'ch2-4.md', 'ch2-5.md'], type: 'chapter' },
      { id: 'ch3', title: 'Organización', files: ['ch3-1.md', 'ch3-2.md', 'ch3-3.md', 'ch3-4.md'], type: 'chapter' },
      { id: 'ch4', title: 'Control de Flujo Asíncrono', files: ['ch4.md'], type: 'chapter' },
      { id: 'ch5', title: 'Colecciones', files: ['ch5.md'], type: 'chapter' },
      { id: 'ch6', title: 'Adiciones a la API', files: ['ch6-1.md', 'ch6-2.md'], type: 'chapter' },
      { id: 'ch7', title: 'Meta Programación', files: ['ch7-1.md', 'ch7-2.md'], type: 'chapter' },
      { id: 'ch8', title: 'Más Allá de ES6', files: ['ch8.md'], type: 'chapter' },
      { id: 'apA', title: 'Agradecimientos', files: ['apA.md'], type: 'appendix' },
    ],
  },
]

/** Map book slug to the actual folder name inside texts_es/ */
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
 * Keys are like "/texts_es/up & going/ch1.md" → () => Promise<string>.
 */
const markdownModules = import.meta.glob<string>(
  [
    '/texts_es/up & going/*.md',
    '/texts_es/scope & closures/*.md',
    '/texts_es/this & object prototypes/*.md',
    '/texts_es/types & grammar/*.md',
    '/texts_es/async & performance/*.md',
    '/texts_es/es6 & beyond/*.md',
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

  const parts = await Promise.all(
    chapter.files.map((file) => {
      const key = `/texts_es/${folder}/${file}`
      const loader = markdownModules[key]
      if (!loader) return Promise.resolve('')
      return loader()
    }),
  )

  const content = parts.filter(Boolean).join('\n\n')
  return content || null
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
