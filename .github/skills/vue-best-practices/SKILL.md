---
name: vue-best-practices
description: Best practices and patterns for Vue 3 development
version: 1.0.0
triggers:
  - review code
  - improve code
  - best practices
---

# Vue Best Practices Skill

Este skill contiene las mejores prácticas para desarrollo Vue 3 en este proyecto.

## Performance Patterns

### 1. Lazy Loading Routes

```typescript
// ✅ Always lazy load route components
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/DashboardView.vue')
  }
]
```

### 2. Dynamic Component Loading

```typescript
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  delay: 200,
  timeout: 3000
})
```

### 3. v-once for Static Content

```vue
<template>
  <!-- Content that never changes -->
  <footer v-once>
    <p>© 2024 Company Name</p>
  </footer>
</template>
```

### 4. v-memo for Expensive Renders

```vue
<template>
  <div v-for="item in list" :key="item.id" v-memo="[item.selected]">
    <!-- Only re-renders when item.selected changes -->
  </div>
</template>
```

### 5. shallowRef for Large Objects

```typescript
// Use shallowRef when you replace the entire object
const largeData = shallowRef(initialData)

// Updates require replacing the whole object
largeData.value = newData
```

## State Management Patterns

### 1. Store Composition

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => user.value !== null)
  
  return { user, isAuthenticated }
})

// stores/auth.ts - Composing stores
export const useAuthStore = defineStore('auth', () => {
  const userStore = useUserStore()
  
  async function login(credentials: Credentials): Promise<void> {
    const response = await api.login(credentials)
    userStore.user = response.user
  }
  
  return { login }
})
```

### 2. Store with Persistence

```typescript
export const useSettingsStore = defineStore('settings', () => {
  const theme = ref(localStorage.getItem('theme') ?? 'system')
  
  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
  })
  
  return { theme }
})
```

## Composable Patterns

### 1. Basic Structure

```typescript
export function useFeature(options?: Options) {
  // State
  const state = ref(initialValue)
  
  // Computed
  const derivedValue = computed(() => transform(state.value))
  
  // Methods
  function update(value: Value): void {
    state.value = value
  }
  
  // Lifecycle cleanup
  onUnmounted(() => {
    cleanup()
  })
  
  return {
    state: readonly(state),
    derivedValue,
    update
  }
}
```

### 2. With Async Operations

```typescript
export function useFetch<T>(url: string) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)
  
  async function execute(): Promise<void> {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await fetch(url)
      data.value = await response.json()
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    data: readonly(data),
    error: readonly(error),
    isLoading: readonly(isLoading),
    execute,
    refresh: execute
  }
}
```

## Template Patterns

### 1. Conditional Rendering

```vue
<template>
  <!-- Use v-if for rarely toggled content -->
  <modal v-if="showModal" />
  
  <!-- Use v-show for frequently toggled content -->
  <dropdown-menu v-show="isMenuOpen" />
</template>
```

### 2. List Rendering

```vue
<template>
  <!-- Always use :key with unique identifier -->
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </ul>
  
  <!-- Use index only when items have no unique ID and list is static -->
  <span v-for="(char, index) in word" :key="index">
    {{ char }}
  </span>
</template>
```

### 3. Event Handling

```vue
<template>
  <!-- Inline for simple operations -->
  <button @click="count++">Increment</button>
  
  <!-- Method reference for logic -->
  <button @click="handleSubmit">Submit</button>
  
  <!-- Method with argument -->
  <button @click="selectItem(item)">Select</button>
  
  <!-- Event modifiers -->
  <form @submit.prevent="handleSubmit">
    <input @keyup.enter="search" />
    <button @click.stop="handleClick">Click</button>
  </form>
</template>
```

## TypeScript Patterns

### 1. Component Props

```typescript
// Simple props
interface Props {
  title: string
  count?: number
}

// Props with complex types
interface Props {
  items: Item[]
  config: Partial<Config>
  status: 'pending' | 'active' | 'complete'
  handler: (id: number) => void
}
```

### 2. Refs Typing

```typescript
// Element refs
const inputRef = ref<HTMLInputElement | null>(null)

// Component refs
const modalRef = ref<InstanceType<typeof BaseModal> | null>(null)
```

### 3. Provide/Inject Typing

```typescript
// types/injection-keys.ts
import type { InjectionKey } from 'vue'

export const ThemeKey: InjectionKey<Theme> = Symbol('theme')

// Parent component
provide(ThemeKey, theme)

// Child component
const theme = inject(ThemeKey)
```

## Anti-Patterns to Avoid

### ❌ Don't Mutate Props

```typescript
// ❌ Bad
props.value = newValue

// ✅ Good - emit event to parent
emit('update:modelValue', newValue)
```

### ❌ Don't Use v-if with v-for

```vue
<!-- ❌ Bad -->
<li v-for="item in items" v-if="item.active">

<!-- ✅ Good - use computed -->
<li v-for="item in activeItems">
```

### ❌ Don't Overuse Watchers

```typescript
// ❌ Often unnecessary
watch(props.value, (newVal) => {
  derivedValue.value = transform(newVal)
})

// ✅ Use computed instead
const derivedValue = computed(() => transform(props.value))
```

### ❌ Avoid Memory Leaks

```typescript
// ✅ Always cleanup subscriptions
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
```
