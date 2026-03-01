<script setup lang="ts">
interface Feature {
  icon: string
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: '♿',
    title: 'Cumplimiento WCAG AAA',
    description: 'Soporte completo de accesibilidad incluyendo optimizaciones para lectores de pantalla y modos de alto contraste para todos los usuarios.',
  },
  {
    icon: '🎨',
    title: 'Temas Personalizados',
    description: 'Personaliza tu lectura con temas Claro y Oscuro. Ajusta la tipografía y el espaciado a tu preferencia.',
  },
  {
    icon: '🔄',
    title: 'Seguimiento Continuo',
    description: 'Progreso sincronizado en la nube en todos tus dispositivos. Retoma exactamente donde lo dejaste, ya sea en móvil o escritorio.',
  },
  {
    icon: '💻',
    title: 'Fragmentos Interactivos',
    description: 'No solo leas código, ejecútalo. Cada fragmento es un sandbox interactivo donde puedes experimentar en tiempo real.',
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
