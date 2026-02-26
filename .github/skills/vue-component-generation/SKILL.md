---
name: vue-component-generation
description: Skill for generating Vue 3 components following project best practices
version: 1.0.0
triggers:
  - create component
  - new component
  - generate component
---

# Vue Component Generation Skill

Este skill proporciona las instrucciones para generar componentes Vue 3 de alta calidad.

## Objetivo

Crear componentes Vue que:

- Siguen las convenciones del proyecto
- Son type-safe con TypeScript
- Tienen estilos consistentes con Tailwind
- Son accesibles
- Son testeables

## Proceso de Generación

### Paso 1: Análisis

Antes de generar, analiza:

1. ¿Qué tipo de componente es? (UI, layout, feature, view)
2. ¿Qué props necesita?
3. ¿Qué eventos emite?
4. ¿Necesita estado interno?
5. ¿Usa algún composable?
6. ¿Se conecta a un store?

### Paso 2: Estructura

```vue
<script setup lang="ts">
  // 1. Imports (vue, router, stores, composables, components, types)

  // 2. Types/Interfaces
  interface Props {
    required: string
    optional?: number
  }

  // 3. Props with defaults
  const props = withDefaults(defineProps<Props>(), {
    optional: 0,
  })

  // 4. Emits
  defineEmits<{
    update: [value: string]
  }>()

  // 5. Composables/Stores
  const store = useMyStore()

  // 6. Reactive state
  const isOpen = ref(false)

  // 7. Computed properties
  const computedValue = computed(() => props.required.toUpperCase())

  // 8. Methods
  function handleClick(): void {
    // logic
  }

  // 9. Lifecycle hooks
  onMounted(() => {
    // setup
  })
</script>

<template>
  <div class="component-name">
    <!-- Semantic HTML -->
    <!-- Accessibility attributes -->
    <!-- Event handlers -->
  </div>
</template>

<style scoped>
  .component-name {
    @apply /* tailwind classes */;
  }
</style>
```

### Paso 3: Mejores Prácticas

1. **Props Validation**

   ```typescript
   interface Props {
     size: 'sm' | 'md' | 'lg' // Union types for constrained values
     items: Item[] // Typed arrays
     config?: Partial<Config> // Optional with Partial
   }
   ```

2. **Event Typing**

   ```typescript
   defineEmits<{
     'update:modelValue': [value: string] // v-model
     click: [event: MouseEvent] // With event object
     submit: [data: FormData] // With custom data
   }>()
   ```

3. **Expose (si necesario)**
   ```typescript
   defineExpose({
     focus: () => inputRef.value?.focus(),
   })
   ```

## Ejemplos de Referencia

### Modal Component

```vue
<script setup lang="ts">
  interface Props {
    modelValue: boolean
    title: string
    size?: 'sm' | 'md' | 'lg'
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'md',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
  }>()

  function close(): void {
    emit('update:modelValue', false)
  }
</script>

<template>
  <teleport to="body">
    <transition name="modal">
      <div
        v-if="modelValue"
        class="modal-overlay"
        @click.self="close"
      >
        <div
          :class="['modal-content', `modal--${size}`]"
          role="dialog"
          aria-modal="true"
        >
          <header class="modal-header">
            <h2>{{ title }}</h2>
            <button
              @click="close"
              aria-label="Close modal"
            >
              ×
            </button>
          </header>
          <div class="modal-body">
            <slot />
          </div>
          <footer class="modal-footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </transition>
  </teleport>
</template>
```

### Form Input Component

```vue
<script setup lang="ts">
  interface Props {
    modelValue: string
    label: string
    type?: 'text' | 'email' | 'password'
    error?: string
    required?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    required: false,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
  }>()

  const inputId = `input-${Math.random().toString(36).slice(2)}`
</script>

<template>
  <div class="form-field">
    <label
      :for="inputId"
      class="form-label"
    >
      {{ label }}
      <span
        v-if="required"
        class="required"
        >*</span
      >
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :class="['form-input', { 'form-input--error': error }]"
      :required="required"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p
      v-if="error"
      class="form-error"
    >
      {{ error }}
    </p>
  </div>
</template>
```

## Testing Guide

Cada componente generado debe tener un test correspondiente:

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(MyComponent, {
      props: {
        /* required props */
      },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('emits event on interaction', async () => {
    const wrapper = mount(MyComponent)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```
