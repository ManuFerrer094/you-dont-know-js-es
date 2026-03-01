<script setup lang="ts">
import { useRouter } from 'vue-router'
import { BOOKS } from '@/data/books'
import { useReadingStore } from '@/stores/reading'

const router = useRouter()
const readingStore = useReadingStore()

function openBook(bookSlug: string): void {
  router.push({ name: 'reader', params: { book: bookSlug, chapter: 'ch1' } })
}
</script>

<template>
  <section class="py-20 px-6">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-black mb-4 text-center" style="color: var(--text);">
        La Serie Completa
      </h2>
      <p class="text-center mb-12 max-w-xl mx-auto" style="color: var(--text-muted);">
        Seis libros. Una misión. Comprender JavaScript de verdad, desde dentro.
      </p>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          v-for="book in BOOKS"
          :key="book.id"
          class="group text-left rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
          :style="{
            background: 'var(--card)',
            borderColor: 'var(--border)',
          }"
          @click="openBook(book.slug)"
        >
          <!-- Book number badge -->
          <div class="flex items-center justify-between mb-4">
            <span
              class="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-black"
              :style="{ background: book.color + '20', color: book.color }"
            >
              {{ book.order }}
            </span>
            <span class="text-xs font-medium" style="color: var(--text-dim);">
              {{ book.chapters.length }} capítulos
            </span>
          </div>

          <!-- Title -->
          <h3
            class="text-lg font-bold mb-2 group-hover:translate-x-1 transition-transform"
            style="color: var(--text);"
          >
            {{ book.title }}
          </h3>

          <!-- Description -->
          <p class="text-sm mb-4 leading-relaxed" style="color: var(--text-muted);">
            {{ book.description }}
          </p>

          <!-- Progress bar -->
          <div class="h-1 rounded-full overflow-hidden" style="background: var(--border);">
            <div
              class="h-full rounded-full transition-all duration-500"
              :style="{
                width: readingStore.bookProgress(book.slug) + '%',
                background: book.color,
              }"
            ></div>
          </div>
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs" style="color: var(--text-dim);">
              {{ readingStore.bookProgress(book.slug) }}% completado
            </span>
            <span
              class="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
              :style="{ color: book.color }"
            >
              Leer →
            </span>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>
