<script setup lang="ts">
interface StatItem {
  value: string
  label: string
}

const stats: StatItem[] = [
  { value: '6', label: 'Core Titles' },
  { value: '2,000+', label: 'Code Snippets' },
  { value: '100%', label: 'Interactive' },
]
</script>

<template>
  <section class="py-16 px-6 border-t border-b transition-colors" :style="{ borderColor: 'var(--border)' }">
    <div class="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 justify-center items-center">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="text-center"
      >
        <div class="text-3xl md:text-4xl font-black mb-1" style="color: var(--text);">
          {{ stat.value }}
        </div>
        <div class="text-xs uppercase tracking-widest font-medium" style="color: var(--text-muted);">
          {{ stat.label }}
        </div>
      </div>
    </div>
  </section>
</template>
