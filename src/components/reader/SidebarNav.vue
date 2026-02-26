<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BOOKS } from '@/data/books'
import { useReadingStore } from '@/stores/reading'
import type { Book, BookChapter } from '@/types/book'

const route = useRoute()
const router = useRouter()
const readingStore = useReadingStore()

const currentBookSlug = computed(() => route.params.book as string)
const currentChapterId = computed(() => route.params.chapter as string)

function isActive(chapter: BookChapter): boolean {
  return chapter.id === currentChapterId.value
}

function navigate(bookSlug: string, chapterId: string): void {
  router.push({ name: 'reader', params: { book: bookSlug, chapter: chapterId } })
}

function selectBook(book: Book): void {
  navigate(book.slug, book.chapters[0]?.id ?? 'ch1')
}

function chapterLabel(chapter: BookChapter): string {
  if (chapter.type === 'foreword') return 'Foreword'
  if (chapter.type === 'preface') return 'Preface'
  if (chapter.type === 'appendix') {
    const letter = chapter.id.replace('ap', '')
    return `Appendix ${letter.toUpperCase()}`
  }
  const num = chapter.id.replace('ch', '')
  return `Chapter ${num}`
}
</script>

<template>
  <aside
    class="w-72 flex-shrink-0 border-r overflow-y-auto h-[calc(100vh-3.5rem)] transition-colors duration-300"
    :style="{ background: 'var(--surface)', borderColor: 'var(--border)' }"
  >
    <!-- Navigation label -->
    <div class="px-5 pt-5 pb-3 flex items-center justify-between">
      <span class="text-xs font-semibold uppercase tracking-widest" style="color: var(--text-muted);">
        Navigation
      </span>
      <span
        class="text-xs font-bold px-2 py-0.5 rounded-full"
        :style="{ background: 'rgba(255,214,0,0.15)', color: 'var(--yellow)' }"
      >
        {{ readingStore.overallProgress }}% Read
      </span>
    </div>

    <!-- Book list -->
    <nav class="px-3 pb-6">
      <div v-for="book in BOOKS" :key="book.id" class="mb-1">
        <!-- Book header -->
        <button
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group"
          :class="currentBookSlug === book.slug
            ? 'font-semibold'
            : 'hover:opacity-90'"
          :style="{
            background: currentBookSlug === book.slug ? 'var(--card)' : 'transparent',
            color: currentBookSlug === book.slug ? 'var(--text)' : 'var(--text-muted)',
          }"
          @click="selectBook(book)"
        >
          <span
            class="w-6 h-6 rounded flex items-center justify-center text-xs font-black flex-shrink-0"
            :style="{ background: book.color + '20', color: book.color }"
          >
            {{ book.order }}
          </span>
          <span class="text-sm truncate">{{ book.shortTitle }}</span>
        </button>

        <!-- Chapter list (expanded for current book) -->
        <div v-if="currentBookSlug === book.slug" class="ml-3 mt-1 mb-3 animate-slide-in">
          <button
            v-for="chapter in book.chapters"
            :key="chapter.id"
            class="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-left transition-all duration-200 text-sm"
            :style="{
              background: isActive(chapter) ? 'rgba(255,214,0,0.1)' : 'transparent',
              color: isActive(chapter) ? 'var(--yellow)' : 'var(--text-muted)',
            }"
            @click="navigate(book.slug, chapter.id)"
          >
            <!-- Read indicator -->
            <span
              class="w-1.5 h-1.5 rounded-full flex-shrink-0"
              :style="{
                background: readingStore.isChapterRead(book.slug, chapter.id)
                  ? 'var(--yellow)'
                  : isActive(chapter)
                    ? 'var(--yellow)'
                    : 'var(--border)',
              }"
            ></span>

            <span class="flex flex-col min-w-0">
              <span
                class="text-[10px] uppercase tracking-wider mb-0.5"
                :style="{ color: isActive(chapter) ? 'var(--yellow)' : 'var(--text-dim)' }"
              >
                {{ chapterLabel(chapter) }}
              </span>
              <span class="truncate" :class="{ 'font-semibold': isActive(chapter) }">
                {{ chapter.title }}
              </span>
            </span>
          </button>
        </div>
      </div>
    </nav>
  </aside>
</template>
