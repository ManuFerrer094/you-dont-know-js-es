<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useJsConsole } from '@/composables/useJsConsole'

const { history, inputValue, execute, clear } = useJsConsole()
const inputRef = ref<HTMLInputElement | null>(null)
const outputRef = ref<HTMLElement | null>(null)

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    execute(inputValue.value)
  }
}

function focusInput(): void {
  inputRef.value?.focus()
}

// Auto-scroll to bottom when new entries arrive
watch(
  () => history.value.length,
  async () => {
    await nextTick()
    if (outputRef.value) {
      outputRef.value.scrollTop = outputRef.value.scrollHeight
    }
  },
)
</script>

<template>
  <aside
    class="w-80 flex-shrink-0 border-l flex flex-col h-[calc(100vh-3.5rem)] transition-colors duration-300"
    :style="{ background: 'var(--surface)', borderColor: 'var(--border)' }"
  >
    <!-- Header tabs -->
    <div class="flex border-b" :style="{ borderColor: 'var(--border)' }">
      <button
        class="flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center"
        :style="{ color: 'var(--yellow)', borderBottom: '2px solid var(--yellow)' }"
      >
        Console
      </button>
      <button
        class="flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-center"
        style="color: var(--text-dim);"
        disabled
      >
        Notes
      </button>
    </div>

    <!-- Console output -->
    <div
      ref="outputRef"
      class="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1 cursor-text"
      @click="focusInput"
    >
      <!-- Welcome message -->
      <div v-if="history.length === 0" class="text-xs" style="color: var(--text-dim);">
        <p class="italic">Interactive JS Sandbox v1.0</p>
        <p class="mt-2">Type JavaScript and press Enter to execute.</p>
      </div>

      <!-- History entries -->
      <div
        v-for="entry in history"
        :key="entry.id"
        class="flex items-start gap-2"
      >
        <span
          class="select-none flex-shrink-0 mt-0.5"
          :style="{
            color: entry.type === 'input' ? 'var(--yellow)' : entry.type === 'error' ? '#ff5370' : 'var(--text-muted)',
          }"
        >
          {{ entry.type === 'input' ? '>' : entry.type === 'error' ? '✖' : ' ' }}
        </span>
        <span
          :class="{
            'text-red-400': entry.type === 'error',
            'italic': entry.type === 'error',
          }"
          :style="{
            color: entry.type === 'input'
              ? 'var(--text)'
              : entry.type === 'error'
                ? '#ff5370'
                : 'var(--yellow)',
          }"
        >
          {{ entry.content }}
        </span>
      </div>
    </div>

    <!-- Input area -->
    <div
      class="border-t p-3 flex items-center gap-2"
      :style="{ borderColor: 'var(--border)' }"
    >
      <span class="text-sm font-mono flex-shrink-0" style="color: var(--yellow);">›</span>
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        placeholder="Type JS here..."
        class="flex-1 bg-transparent outline-none font-mono text-sm"
        :style="{ color: 'var(--text)' }"
        autocomplete="off"
        spellcheck="false"
        @keydown="handleKeydown"
      />
      <button
        class="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
        :style="{ background: 'var(--yellow)', color: '#0a0a0a' }"
        title="Execute"
        @click="execute(inputValue)"
      >
        ▶
      </button>
    </div>

    <!-- Clear button -->
    <div class="px-3 pb-3">
      <button
        class="w-full text-xs py-1.5 rounded-md transition-colors"
        :style="{ background: 'var(--card)', color: 'var(--text-dim)' }"
        @click="clear"
      >
        Clear Console
      </button>
    </div>
  </aside>
</template>
