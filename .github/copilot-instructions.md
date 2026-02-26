# Vue Project Copilot Instructions

Este archivo define las instrucciones y convenciones de código para GitHub Copilot en este proyecto Vue.js.

## Stack Tecnológico

- **Framework**: Vue 3 con Composition API
- **Lenguaje**: TypeScript estricto
- **Build Tool**: Vite
- **Estado**: Pinia (stores con Composition API)
- **Router**: Vue Router 4 con lazy-loading
- **Estilos**: Tailwind CSS
- **Testing**: Vitest + Vue Test Utils
- **Linting**: ESLint + Prettier

## Convenciones de Código

### Componentes Vue

1. **Siempre usa `<script setup lang="ts">`** para todos los componentes
2. **Orden de bloques**: `<script>`, `<template>`, `<style>`
3. **Nombres de componentes**: PascalCase en definición, kebab-case en templates
4. **Props y Emits**: Define con TypeScript type-based declarations

```vue
<script setup lang="ts">
  // ✅ Correcto
  interface Props {
    title: string
    count?: number
  }

  const props = withDefaults(defineProps<Props>(), {
    count: 0,
  })

  defineEmits<{
    update: [value: string]
    close: []
  }>()
</script>

<template>
  <!-- Usa kebab-case para componentes -->
  <base-button @click="handleClick">
    {{ props.title }}
  </base-button>
</template>
```

### TypeScript

1. **Strict mode habilitado**: No uses `any`, define tipos explícitos
2. **Interfaces sobre Types**: Prefiere `interface` para objetos
3. **Return types explícitos**: Siempre especifica tipos de retorno en funciones

```typescript
// ✅ Correcto
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// ❌ Evitar
function calculateTotal(items: any) {
  return items.reduce((sum: any, item: any) => sum + item.price, 0)
}
```

### Pinia Stores

1. **Siempre usa Composition API** (setup stores)
2. **Naming convention**: `use[Name]Store`
3. **Organización**: State → Getters (computed) → Actions

```typescript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => user.value !== null)

  // Actions
  async function fetchUser(): Promise<void> {
    isLoading.value = true
    try {
      user.value = await api.getUser()
    } finally {
      isLoading.value = false
    }
  }

  return { user, isLoading, isAuthenticated, fetchUser }
})
```

### Vue Router

1. **Siempre usa lazy-loading** para rutas:
   ```typescript
   component: () => import('@/views/HomeView.vue')
   ```
2. **Define meta types** para rutas
3. **Usa nombres de rutas** para navegación programática

### Composables

1. **Prefix con `use`**: `useLocalStorage`, `useFetch`, etc.
2. **Retorna refs reactivos** y funciones
3. **Maneja cleanup** en `onUnmounted` si es necesario

### Estilos

1. **Usa Tailwind CSS** como primera opción
2. **Scoped styles** para CSS específico de componentes
3. **Variables CSS** para temas/colores globales
4. **`@apply`** para combinar utilidades en clases semánticas

### Estructura de Archivos

```
src/
├── assets/          # CSS global, imágenes
├── components/
│   ├── ui/          # Componentes base reutilizables
│   └── layout/      # Header, Footer, Sidebar
├── composables/     # Lógica reutilizable (useXxx.ts)
├── views/           # Páginas/Vistas (XxxView.vue)
├── stores/          # Pinia stores
├── router/          # Configuración de rutas
├── types/           # Definiciones de tipos TypeScript
└── utils/           # Funciones utilitarias
```

### Naming Conventions

| Tipo             | Convención       | Ejemplo              |
| ---------------- | ---------------- | -------------------- |
| Componentes      | PascalCase       | `UserProfile.vue`    |
| Composables      | camelCase + use  | `useLocalStorage.ts` |
| Stores           | camelCase + use  | `useUserStore.ts`    |
| Vistas           | PascalCase + Vue | `HomeView.vue`       |
| Utilidades       | camelCase        | `formatDate.ts`      |
| Tipos/Interfaces | PascalCase       | `UserProfile`        |
| Constantes       | SCREAMING_CASE   | `MAX_RETRY_COUNT`    |

## Patrones Preferidos

### Manejo de Errores

```typescript
try {
  await asyncOperation()
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API error
  }
  console.error('Operation failed:', error)
}
```

### Computed con Fallback

```typescript
const displayName = computed(() => user.value?.name ?? 'Guest')
```

### Watch con Cleanup

```typescript
watch(source, (newVal, oldVal, onCleanup) => {
  const controller = new AbortController()
  fetchData(newVal, controller.signal)
  onCleanup(() => controller.abort())
})
```

## Tests

1. **Nombra tests descriptivamente**: `it('increments count when button is clicked')`
2. **Un assertion por test** cuando sea posible
3. **Usa `beforeEach`** para setup repetitivo
4. **Mock stores** con `setActivePinia(createPinia())`
