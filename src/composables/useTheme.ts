import { ref, watch } from 'vue'
import type { ThemeMode } from '@/types/book'

const STORAGE_KEY = 'ydkjs-theme'

const theme = ref<ThemeMode>((localStorage.getItem(STORAGE_KEY) as ThemeMode) ?? 'dark')

function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  root.classList.add(mode)

  if (mode === 'dark') {
    document.body.style.backgroundColor = '#0a0a0a'
    document.body.style.color = '#E8E8E8'
  } else if (mode === 'light') {
    document.body.style.backgroundColor = '#FAFAF8'
    document.body.style.color = '#1a1a1a'
  }
}

// Apply on init
applyTheme(theme.value)

watch(theme, (mode) => {
  localStorage.setItem(STORAGE_KEY, mode)
  applyTheme(mode)
})

export function useTheme() {
  function setTheme(mode: ThemeMode): void {
    theme.value = mode
  }

  function cycleTheme(): void {
    const modes: ThemeMode[] = ['dark', 'light']
    const idx = modes.indexOf(theme.value)
    theme.value = modes[(idx + 1) % modes.length]!
  }

  return {
    theme,
    setTheme,
    cycleTheme,
  }
}
