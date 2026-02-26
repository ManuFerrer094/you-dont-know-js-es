<script setup lang="ts">
interface Feature {
  icon: string
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: '♿',
    title: 'WCAG AAA Compliance',
    description: 'Full accessibility support including screen reader optimizations and high contrast modes for all users.',
  },
  {
    icon: '🎨',
    title: 'Custom Themes',
    description: 'Personalize your reading with Light and Dark themes. Adjust typography and spacing to your preference.',
  },
  {
    icon: '🔄',
    title: 'Seamless Tracking',
    description: 'Cloud-synced progress across all devices. Pick up exactly where you left off, whether on mobile or desktop.',
  },
  {
    icon: '💻',
    title: 'Interactive Snippets',
    description: "Don't just read code—run it. Every snippet is an interactive sandbox where you can experiment in real-time.",
  },
]
</script>

<template>
  <section class="py-20 px-6">
    <div class="max-w-7xl mx-auto">

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="rounded-xl p-6 border transition-all duration-300 hover:scale-[1.02] hover:border-opacity-50"
          :style="{ background: 'var(--card)', borderColor: 'var(--border)' }"
        >
          <div class="text-2xl mb-4">{{ feature.icon }}</div>
          <h3 class="font-bold mb-2" style="color: var(--text);">{{ feature.title }}</h3>
          <p class="text-sm leading-relaxed" style="color: var(--text-muted);">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
