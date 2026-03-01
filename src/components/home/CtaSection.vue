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
</script>

<template>
  <section class="py-24 px-6 text-center">
    <h2 class="text-3xl md:text-5xl font-black mb-4" style="color: var(--text);">
      ¿Listo para Dominar<br/>el Lenguaje?
    </h2>
    <p class="mb-8 max-w-lg mx-auto" style="color: var(--text-muted);">
      Únete a miles de desarrolladores que han impulsado sus carreras comprendiendo verdaderamente
      cómo funciona JavaScript por dentro.
    </p>
    <button
      class="px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95"
      style="background: var(--yellow); color: #0a0a0a;"
      @click="startReading"
    >
      Empezar a Leer Gratis
    </button>
  </section>
</template>
