---
name: new-composable
description: Creates a new composable function
version: 1.0.0
---

# Create New Composable

Crea un nuevo composable Vue siguiendo las convenciones del proyecto.

## Instrucciones

Por favor proporciona:

1. **Nombre del composable**: (ej: "useLocalStorage", "useDebounce", "useFetch")
2. **Propósito**: ¿Qué problema resuelve?
3. **Parámetros de entrada**: ¿Qué recibe como argumentos?
4. **Valores de retorno**: ¿Qué devuelve?

## Template de Composable

````typescript
import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'

// Types
interface Use{Name}Options {
  // opciones configurables
}

interface Use{Name}Return {
  // valores que devuelve
}

/**
 * {Descripción del composable}
 *
 * @param {options} - Configuration options
 * @returns {Use{Name}Return}
 *
 * @example
 * ```ts
 * const { value, update } = use{Name}({ option: true })
 * ```
 */
export function use{Name}(options: Use{Name}Options = {}): Use{Name}Return {
  // ===== OPTIONS DEFAULTS =====
  const { /* destructure with defaults */ } = options

  // ===== STATE =====
  const value = ref<ValueType>(initialValue)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  // ===== COMPUTED =====
  const derivedValue = computed(() => {
    return transform(value.value)
  })

  // ===== METHODS =====
  function update(newValue: ValueType): void {
    value.value = newValue
  }

  function reset(): void {
    value.value = initialValue
  }

  // ===== LIFECYCLE =====
  onMounted(() => {
    // setup listeners, fetch initial data, etc.
  })

  onUnmounted(() => {
    // cleanup: remove listeners, cancel requests, etc.
  })

  // ===== RETURN =====
  return {
    value: readonly(value),
    derivedValue,
    isLoading: readonly(isLoading),
    error: readonly(error),
    update,
    reset,
  }
}
````

## Ejemplos Comunes

### useLocalStorage

```typescript
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const storedValue = localStorage.getItem(key)
  const value = ref<T>(storedValue ? JSON.parse(storedValue) : defaultValue)

  watch(
    value,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )

  return value
}
```

### useDebounce

```typescript
export function useDebounce<T>(value: Ref<T>, delay = 300) {
  const debouncedValue = ref(value.value) as Ref<T>
  let timeout: ReturnType<typeof setTimeout>

  watch(value, (newValue) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })

  onUnmounted(() => clearTimeout(timeout))

  return debouncedValue
}
```

### useEventListener

```typescript
export function useEventListener<K extends keyof WindowEventMap>(
  target: Window | HTMLElement,
  event: K,
  callback: (event: WindowEventMap[K]) => void
) {
  onMounted(() => {
    target.addEventListener(event, callback as EventListener)
  })

  onUnmounted(() => {
    target.removeEventListener(event, callback as EventListener)
  })
}
```

## Test del Composable

```typescript
import { describe, it, expect } from 'vitest'
import { use{Name} } from './use{Name}'

describe('use{Name}', () => {
  it('returns expected initial value', () => {
    const { value } = use{Name}()
    expect(value.value).toBe(expectedInitial)
  })

  it('updates value correctly', () => {
    const { value, update } = use{Name}()
    update(newValue)
    expect(value.value).toBe(newValue)
  })
})
```

## Checklist

- [ ] Nombre con prefijo `use`
- [ ] Tipos exportados para opciones y retorno
- [ ] JSDoc con descripción y ejemplo
- [ ] Cleanup en `onUnmounted` si necesario
- [ ] Valores readonly donde apropiado
- [ ] Test unitario creado
