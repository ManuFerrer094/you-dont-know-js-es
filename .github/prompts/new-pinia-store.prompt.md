---
name: new-pinia-store
description: Creates a new Pinia store with Composition API
version: 1.0.0
---

# Create New Pinia Store

Crea un nuevo store de Pinia siguiendo las convenciones del proyecto.

## Instrucciones

Por favor proporciona:

1. **Nombre del store**: (ej: "user", "cart", "notifications")
2. **Estado inicial**: Describe las propiedades del estado
3. **Acciones necesarias**: Lista de operaciones que debe hacer
4. **¿Necesita persistencia?**: ¿Guardar en localStorage?

## Template de Store

```typescript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// Types
interface {Entity} {
  id: number
  // otras propiedades
}

export const use{Name}Store = defineStore('{name}', () => {
  // ===== STATE =====
  const items = ref<{Entity}[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  // ===== GETTERS =====
  const count = computed(() => items.value.length)
  const isEmpty = computed(() => items.value.length === 0)

  // ===== ACTIONS =====
  async function fetch(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      // API call
      items.value = await api.getItems()
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
    } finally {
      isLoading.value = false
    }
  }

  function add(item: {Entity}): void {
    items.value.push(item)
  }

  function remove(id: number): void {
    items.value = items.value.filter(item => item.id !== id)
  }

  function reset(): void {
    items.value = []
    error.value = null
  }

  return {
    // State
    items,
    isLoading,
    error,
    // Getters
    count,
    isEmpty,
    // Actions
    fetch,
    add,
    remove,
    reset,
  }
})
```

## Con Persistencia (localStorage)

```typescript
import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const use{Name}Store = defineStore('{name}', () => {
  // Load from localStorage
  const STORAGE_KEY = '{name}-store'
  const savedData = localStorage.getItem(STORAGE_KEY)
  const initialState = savedData ? JSON.parse(savedData) : defaultState

  const state = ref(initialState)

  // Persist on change
  watch(
    state,
    (newState) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
    },
    { deep: true }
  )

  return { state }
})
```

## Test del Store

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { use{Name}Store } from './{name}'

describe('{Name} Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with empty state', () => {
    const store = use{Name}Store()
    expect(store.items).toEqual([])
  })

  it('adds item correctly', () => {
    const store = use{Name}Store()
    store.add({ id: 1, name: 'Test' })
    expect(store.count).toBe(1)
  })
})
```

## Ejemplo de Uso

**Input**:

- Nombre: "cart"
- Estado: items (productos), total, itemCount
- Acciones: addItem, removeItem, updateQuantity, clear
- Persistencia: Sí

**Output**: Genera store con carrito de compras completo.
