import { ref, computed, watch } from 'vue'
import type { ConsoleEntry } from '@/types/book'

export function useJsConsole() {
  const history = ref<ConsoleEntry[]>([])
  const inputValue = ref('')
  let entryCounter = 0

  function addEntry(type: ConsoleEntry['type'], content: string): void {
    history.value.push({ id: ++entryCounter, type, content })
  }

  function execute(code: string): void {
    if (!code.trim()) return

    addEntry('input', code)
    inputValue.value = ''

    try {
      // Create a sandboxed-ish eval. We capture console.log output.
      const logs: string[] = []
      const sandboxConsole = {
        log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
        warn: (...args: unknown[]) => logs.push('⚠ ' + args.map(String).join(' ')),
        error: (...args: unknown[]) => logs.push('✖ ' + args.map(String).join(' ')),
        info: (...args: unknown[]) => logs.push('ℹ ' + args.map(String).join(' ')),
      }

      // eslint-disable-next-line no-new-func
      const fn = new Function('console', code)
      const result = fn(sandboxConsole)

      if (logs.length > 0) {
        for (const log of logs) {
          addEntry('output', log)
        }
      }

      if (result !== undefined) {
        addEntry('output', String(result))
      } else if (logs.length === 0) {
        addEntry('output', 'undefined')
      }
    } catch (err) {
      addEntry('error', err instanceof Error ? err.message : String(err))
    }
  }

  function clear(): void {
    history.value = []
  }

  const isEmpty = computed(() => history.value.length === 0)

  // Persist history in sessionStorage
  const STORAGE_KEY = 'ydkjs-console-history'
  const stored = sessionStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as ConsoleEntry[]
      history.value = parsed
      entryCounter = parsed.length
    } catch {
      // ignore
    }
  }

  watch(
    history,
    (val) => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    },
    { deep: true },
  )

  return {
    history,
    inputValue,
    isEmpty,
    execute,
    clear,
  }
}
