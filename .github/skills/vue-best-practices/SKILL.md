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

## Vue Best Practices Workflow

Use this skill as an instruction set. Follow the workflow in order unless the user explicitly asks for a different order.

Core Principles
- Keep state predictable: one source of truth, derive everything else.
- Make data flow explicit: Props down, Events up for most cases.
- Favor small, focused components: easier to test, reuse, and maintain.
- Avoid unnecessary re-renders: use computed properties and watchers wisely.
- Readability counts: write clear, self-documenting code.

1) Confirm architecture before coding (required)
Default stack: Vue 3 + Composition API + <script setup lang="ts">.
If the project explicitly uses Options API, load vue-options-api-best-practices skill if available.
If the project explicitly uses JSX, load vue-jsx-best-practices skill if available.

1.1 Must-read core references (required)
Before implementing any Vue task, make sure to read and apply these core references:
- references/reactivity.md
- references/sfc.md
- references/component-data-flow.md
- references/composables.md
Keep these references in active working context for the entire task, not only when a specific issue appears.

1.2 Plan component boundaries before coding (required)
Create a brief component map before implementation for any non-trivial feature.

Define each component's single responsibility in one sentence.
Keep entry/root and route-level view components as composition surfaces by default.
Move feature UI and feature logic out of entry/root/view components unless the task is intentionally a tiny single-file demo.
Define props/emits contracts for each child component in the map.
Prefer a feature folder layout (components/<feature>/..., composables/use<Feature>.ts) when adding more than one component.

2) Apply essential Vue foundations (required)
These are essential, must-know foundations. Apply all of them in every Vue task using the core references already loaded in section 1.1.

Reactivity
Must-read reference from 1.1: reactivity
Keep source state minimal (ref/reactive), derive everything possible with computed.
Use watchers for side effects if needed.
Avoid recomputing expensive logic in templates.

SFC structure and template safety
Must-read reference from 1.1: sfc
Keep SFC sections in this order: <script> → <template> → <style>.
Keep SFC responsibilities focused; split large components.
Keep templates declarative; move branching/derivation to script.
Apply Vue template safety rules (v-html, list rendering, conditional rendering choices).
Keep components focused
Split a component when it has more than one clear responsibility (e.g. data orchestration + UI, or multiple independent UI sections).

Prefer smaller components + composables over one “mega component”
Move UI sections into child components (props in, events out).
Move state/side effects into composables (useXxx()).
Apply objective split triggers. Split the component if any condition is true:

It owns both orchestration/state and substantial presentational markup for multiple sections.
It has 3+ distinct UI sections (for example: form, filters, list, footer/status).
A template block is repeated or could become reusable (item rows, cards, list entries).
Entry/root and route view rule:

Keep entry/root and route view components thin: app shell/layout, provider wiring, and feature composition.
Do not place full feature implementations in entry/root/view components when those features contain independent parts.
For CRUD/list features (todo, table, catalog, inbox), split at least into:
feature container component
input/form component
list (and/or item) component
footer/actions or filter/status component
Allow a single-file implementation only for very small throwaway demos; if chosen, explicitly justify why splitting is unnecessary.
Component data flow
Must-read reference from 1.1: component-data-flow
Use props down, events up as the primary model.
Use v-model only for true two-way component contracts.
Use provide/inject only for deep-tree dependencies or shared context.
Keep contracts explicit and typed with defineProps, defineEmits, and InjectionKey as needed.
Composables
Must-read reference from 1.1: composables
Extract logic into composables when it is reused, stateful, or side-effect heavy.
Keep composable APIs small, typed, and predictable.
Separate feature logic from presentational components.

3) Consider optional features only when requirements call for them
3.1 Standard optional features
Do not add these by default. Load the matching reference only when the requirement exists.

Slots: parent needs to control child content/layout -> component-slots
Fallthrough attributes: wrapper/base components must forward attrs/events safely -> component-fallthrough-attrs
Built-in component <KeepAlive> for stateful view caching -> component-keep-alive
Built-in component <Teleport> for overlays/portals -> component-teleport
Built-in component <Suspense> for async subtree fallback boundaries -> component-suspense
Animation-related features: pick the simplest approach that matches the required motion behavior.
Built-in component <Transition> for enter/leave effects -> transition
Built-in component <TransitionGroup> for animated list mutations -> transition-group
Class-based animation for non-enter/leave effects -> animation-class-based-technique
State-driven animation for user-input-driven animation -> animation-state-driven-technique
3.2 Less-common optional features
Use these only when there is explicit product or technical need.

Directives: behavior is DOM-specific and not a good composable/component fit -> directives
Async components: heavy/rarely-used UI should be lazy loaded -> component-async
Render functions only when templates cannot express the requirement -> render-functions
Plugins when behavior must be installed app-wide -> plugins
State management patterns: app-wide shared state crosses feature boundaries -> state-management

4) Run performance optimization after behavior is correct
Performance work is a post-functionality pass. Do not optimize before core behavior is implemented and verified.

Large list rendering bottlenecks -> perf-virtualize-large-lists
Static subtrees re-rendering unnecessarily -> perf-v-once-v-memo-directives
Over-abstraction in hot list paths -> perf-avoid-component-abstraction-in-lists
Expensive updates triggered too often -> updated-hook-performance

5) Final self-check before finishing
Core behavior works and matches requirements.
All must-read references were read and applied.
Reactivity model is minimal and predictable.
SFC structure and template rules are followed.
Components are focused and well-factored, splitting when needed.
Entry/root and route view components remain composition surfaces unless there is an explicit small-demo exception.
Component split decisions are explicit and defensible (responsibility boundaries are clear).
Data flow contracts are explicit and typed.
Composables are used where reuse/complexity justifies them.
Moved state/side effects into composables if applicable
Optional features are used only when requirements demand them.
Performance changes were applied only after functionality was complete.
*** End Patch

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
