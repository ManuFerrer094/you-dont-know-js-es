<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer
    class="border-t py-8 px-6 transition-colors duration-300"
    :style="{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }"
  >
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-7 h-7 rounded-md flex items-center justify-center font-black text-xs" style="background: var(--yellow); color: #0a0a0a;">
          JS
        </div>
        <span class="text-sm font-medium" style="color: var(--text-muted);">
          YDKJS <span class="font-normal">ONLINE</span>
        </span>
      </div>

      <nav class="flex items-center gap-6 text-sm" style="color: var(--text-muted);">
        <a
          href="https://github.com/ManuFerrer094/you-dont-know-js-es"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:underline"
          :style="{ color: 'var(--text-muted)' }"
        >
          GitHub
        </a>
        <span>Privacy</span>
        <span>Terms</span>
      </nav>

      <p class="text-xs" style="color: var(--text-dim);">
        &copy; {{ currentYear }} Kyle Simpson and Contributors. Built for the Open Web.
      </p>
    </div>
  </footer>
</template>
