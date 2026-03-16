<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useReadingStore } from '@/stores/reading'

const route = useRoute()
const router = useRouter()
const { theme, cycleTheme } = useTheme()
const readingStore = useReadingStore()

const isReader = computed(() => route.name === 'reader')

// Single SVG toggle will be used for theme switching

function goHome(): void {
  router.push({ name: 'home' })
}

function continueReading(): void {
  const last = readingStore.getLastRead()
  if (last) {
    router.push({ name: 'reader', params: { book: last.bookSlug, chapter: last.chapterId } })
  } else {
    router.push({ name: 'reader', params: { book: 'up-going', chapter: 'ch1' } })
  }
}
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 lg:px-6 h-14 border-b transition-colors duration-300"
    :style="{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }"
  >
    <!-- Left: Logo -->
    <div class="flex items-center gap-3 cursor-pointer" @click="goHome">
      <div class="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm" style="background: var(--yellow); color: #0a0a0a;">
        JS
      </div>
      <span class="font-bold text-sm tracking-wide hidden sm:inline" style="color: var(--text);">
        No Sabes <span style="color: var(--text-muted);" class="font-normal">JS</span>
      </span>
    </div>

    <!-- Center: Nav Links -->
    <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
      <router-link
        :to="{ name: 'home' }"
        class="transition-colors hover:opacity-100"
        :style="{ color: route.name === 'home' ? 'var(--yellow)' : 'var(--text-muted)' }"
      >
        Libros
      </router-link>
      <router-link
        :to="{ name: 'library' }"
        class="transition-colors hover:opacity-100"
        :style="{ color: route.name === 'library' ? 'var(--yellow)' : 'var(--text-muted)' }"
      >
        Biblioteca
      </router-link>
      <button
        class="transition-colors hover:opacity-100"
        :style="{ color: 'var(--text-muted)' }"
        @click="continueReading"
      >
        Continuar Leyendo
      </button>
    </nav>

    <!-- Right: Actions -->
    <div class="flex items-center gap-2">
      <!-- Theme toggle: single button with SVG icons (sun / moon) -->
      <div class="flex items-center rounded-lg p-0.5" :style="{ background: 'var(--card)' }">
        <button
          class="w-10 h-10 rounded-md flex items-center justify-center transition-all"
          :style="{ background: 'transparent', color: 'var(--text-muted)' }"
          @click="cycleTheme()"
          :title="theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'"
          aria-label="Cambiar tema"
        >
          <!-- Show sun when current is dark (action: switch to light) -->
          <svg v-if="theme === 'dark'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="M4.93 4.93l1.41 1.41" />
            <path d="M17.66 17.66l1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="M4.93 19.07l1.41-1.41" />
            <path d="M17.66 6.34l1.41-1.41" />
          </svg>
          <!-- Show moon when current is light (action: switch to dark) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </div>

      <!-- Progress indicator (only in reader) -->
      <div
        v-if="isReader"
        class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
        :style="{ background: 'var(--card)', color: 'var(--yellow)' }"
      >
        <span>{{ readingStore.overallProgress }}% Leído</span>
      </div>
    </div>
  </header>
</template>
