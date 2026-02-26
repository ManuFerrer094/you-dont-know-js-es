<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useReadingStore } from '@/stores/reading'
import type { ThemeMode } from '@/types/book'

const route = useRoute()
const router = useRouter()
const { theme, setTheme } = useTheme()
const readingStore = useReadingStore()

const isReader = computed(() => route.name === 'reader')

const themeIcons: Record<ThemeMode, string> = {
  dark: '🌙',
  light: '☀️',
}

const themes: ThemeMode[] = ['dark', 'light']

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
        YDKJS <span style="color: var(--text-muted);" class="font-normal">ONLINE</span>
      </span>
    </div>

    <!-- Center: Nav Links -->
    <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
      <router-link
        :to="{ name: 'home' }"
        class="transition-colors hover:opacity-100"
        :style="{ color: route.name === 'home' ? 'var(--yellow)' : 'var(--text-muted)' }"
      >
        Books
      </router-link>
      <router-link
        :to="{ name: 'library' }"
        class="transition-colors hover:opacity-100"
        :style="{ color: route.name === 'library' ? 'var(--yellow)' : 'var(--text-muted)' }"
      >
        Library
      </router-link>
      <button
        class="transition-colors hover:opacity-100"
        :style="{ color: 'var(--text-muted)' }"
        @click="continueReading"
      >
        Continue Reading
      </button>
    </nav>

    <!-- Right: Actions -->
    <div class="flex items-center gap-2">
      <!-- Theme switcher -->
      <div class="flex items-center rounded-lg p-0.5" :style="{ background: 'var(--card)' }">
        <button
          v-for="t in themes"
          :key="t"
          class="w-8 h-8 rounded-md flex items-center justify-center text-sm transition-all"
          :class="{ 'ring-1': theme === t }"
          :style="{
            background: theme === t ? 'var(--yellow)' : 'transparent',
            color: theme === t ? '#0a0a0a' : 'var(--text-muted)',
          }"
          :title="`${t} theme`"
          @click="setTheme(t)"
        >
          {{ themeIcons[t] }}
        </button>
      </div>

      <!-- Progress indicator (only in reader) -->
      <div
        v-if="isReader"
        class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
        :style="{ background: 'var(--card)', color: 'var(--yellow)' }"
      >
        <span>{{ readingStore.overallProgress }}% Read</span>
      </div>
    </div>
  </header>
</template>
