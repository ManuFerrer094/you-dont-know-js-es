<script setup lang="ts">
import { useRouter } from 'vue-router'
import { BOOKS } from '@/data/books'
import { useReadingStore } from '@/stores/reading'
import AppFooter from '@/components/layout/AppFooter.vue'

const router = useRouter()
const readingStore = useReadingStore()

function openChapter(bookSlug: string, chapterId: string): void {
  router.push({ name: 'reader', params: { book: bookSlug, chapter: chapterId } })
}

function chapterLabel(type: string, id: string): string {
  if (type === 'foreword') return 'Foreword'
  if (type === 'preface') return 'Preface'
  if (type === 'appendix') return `Appendix ${id.replace('ap', '').toUpperCase()}`
  return `Ch ${id.replace('ch', '')}`
}
</script>

<template>
  <div class="min-h-screen pt-14">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <h1 class="text-3xl md:text-4xl font-black mb-2" style="color: var(--text);">Library</h1>
      <p class="mb-10" style="color: var(--text-muted);">
        Browse the complete "You Don't Know JS" series. Track your progress across all six books.
      </p>

      <!-- Overall progress -->
      <div class="mb-12 p-6 rounded-2xl border" :style="{ background: 'var(--card)', borderColor: 'var(--border)' }">
        <div class="flex items-center justify-between mb-3">
          <span class="font-semibold" style="color: var(--text);">Overall Progress</span>
          <span class="text-sm font-bold" style="color: var(--yellow);">{{ readingStore.overallProgress }}%</span>
        </div>
        <div class="h-2 rounded-full overflow-hidden" :style="{ background: 'var(--border)' }">
          <div
            class="h-full rounded-full transition-all duration-500"
            :style="{ width: readingStore.overallProgress + '%', background: 'var(--yellow)' }"
          ></div>
        </div>
        <div class="flex justify-between mt-2 text-xs" style="color: var(--text-dim);">
          <span>{{ readingStore.completedChapters }} chapters completed</span>
          <span>{{ readingStore.totalChapters }} total</span>
        </div>
      </div>

      <!-- Books detail -->
      <div class="space-y-8">
        <div
          v-for="book in BOOKS"
          :key="book.id"
          class="rounded-2xl border overflow-hidden"
          :style="{ background: 'var(--card)', borderColor: 'var(--border)' }"
        >
          <!-- Book header -->
          <div class="p-6 flex flex-col sm:flex-row sm:items-center gap-4" :style="{ borderBottom: '1px solid var(--border)' }">
            <span
              class="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black flex-shrink-0"
              :style="{ background: book.color + '20', color: book.color }"
            >
              {{ book.order }}
            </span>
            <div class="flex-1 min-w-0">
              <h2 class="text-xl font-bold" style="color: var(--text);">{{ book.title }}</h2>
              <p class="text-sm mt-1" style="color: var(--text-muted);">{{ book.description }}</p>
            </div>
            <div class="text-right flex-shrink-0">
              <span class="text-2xl font-black" :style="{ color: book.color }">
                {{ readingStore.bookProgress(book.slug) }}%
              </span>
            </div>
          </div>

          <!-- Chapter list -->
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" :style="{ background: 'var(--border)' }">
            <button
              v-for="ch in book.chapters"
              :key="ch.id"
              class="text-left p-4 transition-all hover:opacity-90"
              :style="{ background: 'var(--card)' }"
              @click="openChapter(book.slug, ch.id)"
            >
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="w-2 h-2 rounded-full flex-shrink-0"
                  :style="{
                    background: readingStore.isChapterRead(book.slug, ch.id) ? 'var(--yellow)' : 'var(--border)',
                  }"
                ></span>
                <span class="text-[10px] uppercase tracking-wider" style="color: var(--text-dim);">
                  {{ chapterLabel(ch.type, ch.id) }}
                </span>
              </div>
              <span class="text-sm font-medium" style="color: var(--text);">{{ ch.title }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <app-footer />
  </div>
</template>
