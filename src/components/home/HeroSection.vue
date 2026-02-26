<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useReadingStore } from '@/stores/reading'

const router = useRouter()
const readingStore = useReadingStore()

function startReading(): void {
  const last = readingStore.getLastRead()
  if (last) {
    router.push({ name: 'reader', params: { book: last.bookSlug, chapter: last.chapterId } })
  } else {
    router.push({ name: 'reader', params: { book: 'up-going', chapter: 'ch1' } })
  }
}

function exploreLibrary(): void {
  router.push({ name: 'library' })
}
</script>

<template>
  <section class="relative min-h-[90vh] flex items-center overflow-hidden">
    <!-- Background gradient -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-20 -left-32 w-96 h-96 rounded-full opacity-10 blur-3xl" style="background: var(--yellow);"></div>
      <div class="absolute bottom-20 right-0 w-80 h-80 rounded-full opacity-5 blur-3xl" style="background: var(--yellow);"></div>
    </div>

    <div class="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
      <!-- Left: Text -->
      <div class="animate-fade-in">
        <div
          class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6"
          :style="{ background: 'rgba(255, 214, 0, 0.1)', color: 'var(--yellow)' }"
        >
          <span class="w-2 h-2 rounded-full animate-pulse-yellow" style="background: var(--yellow);"></span>
          Interactive Edition
        </div>

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6" style="color: var(--text);">
          Deep Dive into<br/>
          <span style="color: var(--yellow);" class="italic font-serif">JavaScript</span>
        </h1>

        <p class="text-lg mb-8 max-w-lg" style="color: var(--text-muted);">
          Master the core mechanics of the language with the world-renowned
          "You Don't Know JS" series, now in a high-end digital reading experience
          engineered for the modern developer.
        </p>

        <div class="flex flex-wrap gap-4">
          <button
            class="px-7 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
            style="background: var(--yellow); color: #0a0a0a;"
            @click="startReading"
          >
            Start Reading Free
          </button>
          <button
            class="px-7 py-3.5 rounded-xl font-semibold text-sm border transition-all hover:scale-105 active:scale-95"
            :style="{ borderColor: 'var(--border)', color: 'var(--text)', background: 'transparent' }"
            @click="exploreLibrary"
          >
            Explore Library
          </button>
        </div>
      </div>

      <!-- Right: Book cover -->
      <div class="flex justify-center lg:justify-end animate-fade-in" style="animation-delay: 0.2s;">
        <div
          class="w-72 h-96 rounded-2xl p-8 flex flex-col justify-between shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500"
          style="background: var(--yellow);"
        >
          <div>
            <span class="text-6xl font-black text-black/90">JS</span>
          </div>
          <div>
            <h2 class="text-lg font-black uppercase text-black/80 leading-tight">
              You Don't Know JavaScript Yet
            </h2>
            <p class="text-sm text-black/50 mt-1">Get Started — 2nd Edition</p>
            <div class="mt-4 flex items-center justify-between">
              <span class="text-xs font-bold text-black/60 uppercase tracking-wider">Kyle Simpson</span>
              <span class="text-black/40">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
