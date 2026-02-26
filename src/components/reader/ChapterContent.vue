<script setup lang="ts">
import { computed, watch, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMarkdown } from '@/composables/useMarkdown'
import { getChapterContent, getBookBySlug, getNextChapter, getPrevChapter } from '@/data/books'
import { useReadingStore } from '@/stores/reading'

const route = useRoute()
const router = useRouter()
const { render } = useMarkdown()
const readingStore = useReadingStore()

const contentRef = ref<HTMLElement | null>(null)
const scrollPercent = ref(0)
const rawContent = ref<string | null>(null)
const isLoading = ref(false)

const bookSlug = computed(() => route.params.book as string)
const chapterId = computed(() => route.params.chapter as string)

const book = computed(() => getBookBySlug(bookSlug.value))
const chapter = computed(() => book.value?.chapters.find((c) => c.id === chapterId.value))

const htmlContent = computed(() => (rawContent.value ? render(rawContent.value) : ''))

const nextChapter = computed(() => getNextChapter(bookSlug.value, chapterId.value))
const prevChapter = computed(() => getPrevChapter(bookSlug.value, chapterId.value))

const breadcrumbBook = computed(() => {
  if (!book.value) return ''
  return `Book ${book.value.order}`
})

const breadcrumbChapter = computed(() => {
  if (!chapter.value) return ''
  if (chapter.value.type === 'foreword') return 'Foreword'
  if (chapter.value.type === 'appendix') return `Appendix ${chapter.value.id.replace('ap', '').toUpperCase()}`
  return `Chapter ${chapter.value.id.replace('ch', '')}`
})

function handleScroll(): void {
  const el = contentRef.value
  if (!el) return
  const percent = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100)
  scrollPercent.value = Math.min(100, Math.max(0, percent))
  readingStore.updateProgress(bookSlug.value, chapterId.value, scrollPercent.value)
}

function goToChapter(target: { bookSlug: string; chapterId: string }): void {
  router.push({ name: 'reader', params: { book: target.bookSlug, chapter: target.chapterId } })
}

// Load content async
async function loadContent(): Promise<void> {
  isLoading.value = true
  rawContent.value = null
  const content = await getChapterContent(bookSlug.value, chapterId.value)
  rawContent.value = content
  isLoading.value = false
}

// Scroll to top and load content on chapter change
watch([bookSlug, chapterId], () => {
  if (contentRef.value) {
    contentRef.value.scrollTop = 0
  }
  loadContent()
}, { immediate: true })

onMounted(() => {
  contentRef.value?.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  contentRef.value?.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <main
    ref="contentRef"
    class="flex-1 overflow-y-auto h-[calc(100vh-3.5rem)]"
    :style="{ background: 'var(--bg)' }"
  >
    <!-- Reading progress bar -->
    <div class="sticky top-0 z-10 h-0.5" :style="{ background: 'var(--border)' }">
      <div
        class="h-full transition-all duration-150"
        :style="{ width: scrollPercent + '%', background: 'var(--yellow)' }"
      ></div>
    </div>

    <div class="max-w-3xl mx-auto px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-xs font-medium mb-8" style="color: var(--text-dim);">
        <span class="uppercase tracking-wider">{{ breadcrumbBook }}</span>
        <span style="color: var(--border);">›</span>
        <span class="uppercase tracking-wider">{{ breadcrumbChapter }}</span>
        <span style="color: var(--border);">›</span>
        <span class="uppercase tracking-wider" style="color: var(--yellow);">{{ chapter?.title }}</span>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="flex items-center justify-center py-20">
        <div class="w-8 h-8 border-2 rounded-full animate-spin" :style="{ borderColor: 'var(--border)', borderTopColor: 'var(--yellow)' }"></div>
      </div>

      <!-- Chapter content -->
      <article
        v-else-if="htmlContent"
        class="chapter-content animate-fade-in"
        v-html="htmlContent"
      ></article>

      <!-- Not found -->
      <div v-else class="text-center py-20">
        <p class="text-xl" style="color: var(--text-muted);">
          Chapter not found
        </p>
      </div>

      <!-- Chapter navigation -->
      <nav class="flex items-stretch gap-4 mt-16 mb-8 pt-8 border-t" :style="{ borderColor: 'var(--border)' }">
        <button
          v-if="prevChapter"
          class="flex-1 text-left rounded-xl p-5 border transition-all hover:scale-[1.01]"
          :style="{ background: 'var(--card)', borderColor: 'var(--border)' }"
          @click="goToChapter(prevChapter)"
        >
          <span class="text-xs uppercase tracking-wider block mb-1" style="color: var(--text-dim);">
            Previous
          </span>
          <span class="font-semibold text-sm" style="color: var(--text);">
            {{ prevChapter.chapterTitle }}
          </span>
        </button>

        <button
          v-if="nextChapter"
          class="flex-1 text-right rounded-xl p-5 border transition-all hover:scale-[1.01]"
          :style="{ background: 'var(--card)', borderColor: 'var(--border)' }"
          @click="goToChapter(nextChapter)"
        >
          <span class="text-xs uppercase tracking-wider block mb-1" style="color: var(--text-dim);">
            Next Chapter
          </span>
          <span class="font-semibold text-sm" style="color: var(--text);">
            {{ nextChapter.chapterTitle }}
          </span>
        </button>
      </nav>
    </div>
  </main>
</template>
