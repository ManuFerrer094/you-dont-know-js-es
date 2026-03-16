<script setup lang="ts">
import { computed } from 'vue'
import SidebarNav from '@/components/reader/SidebarNav.vue'
import ChapterContent from '@/components/reader/ChapterContent.vue'
import { useReadingStore } from '@/stores/reading'

const readingStore = useReadingStore()

const showSidebar = computed(() => readingStore.sidebarOpen)
const showConsole = computed(() => readingStore.consoleOpen)
</script>

<template>
  <div class="flex pt-14 h-screen overflow-hidden">
    <!-- Toggle sidebar button (mobile) -->
    <button
      class="fixed bottom-4 right-4 z-50 lg:hidden w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
      :style="{ background: 'var(--yellow)', color: '#0a0a0a' }"
      @click="readingStore.toggleSidebar()"
      aria-label="Abrir menú"
    >
      ☰
    </button>

    <!-- Toggle console button (mobile) -->
    <!-- Removed unused console toggle button (mobile) -->

    <!-- Sidebar overlay (mobile) -->
    <div
      v-if="showSidebar"
      class="fixed inset-0 z-40 bg-black/50 lg:hidden"
      @click="readingStore.toggleSidebar()"
    ></div>

    <!-- Sidebar -->
    <transition name="slide-fade">
      <sidebar-nav
        v-if="showSidebar"
        class="fixed lg:relative z-50 lg:z-auto"
      />
    </transition>

    <!-- Main content -->
    <chapter-content />

    <!-- Console overlay (mobile) -->
    <div
      v-if="showConsole"
      class="fixed inset-0 z-40 bg-black/50 xl:hidden"
      @click="readingStore.toggleConsole()"
    ></div>
  </div>
</template>
