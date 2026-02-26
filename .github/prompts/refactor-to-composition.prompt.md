---
name: refactor-to-composition
description: Refactors Options API components to Composition API
version: 1.0.0
---

# Refactor Options API to Composition API

Convierte componentes Vue de Options API a Composition API con `<script setup>`.

## Proceso de Conversión

### 1. Data → ref/reactive

```typescript
// Options API
data() {
  return {
    count: 0,
    user: null,
    items: []
  }
}

// Composition API
const count = ref(0)
const user = ref<User | null>(null)
const items = ref<Item[]>([])
```

### 2. Computed → computed()

```typescript
// Options API
computed: {
  fullName() {
    return `${this.firstName} ${this.lastName}`
  }
}

// Composition API
const fullName = computed(() => `${firstName.value} ${lastName.value}`)
```

### 3. Methods → functions

```typescript
// Options API
methods: {
  increment() {
    this.count++
  }
}

// Composition API
function increment(): void {
  count.value++
}
```

### 4. Watch → watch()

```typescript
// Options API
watch: {
  searchQuery(newVal, oldVal) {
    this.search(newVal)
  }
}

// Composition API
watch(searchQuery, (newVal, oldVal) => {
  search(newVal)
})
```

### 5. Lifecycle Hooks

```typescript
// Options API → Composition API
created → onBeforeMount (or just top-level code)
mounted → onMounted
beforeUpdate → onBeforeUpdate
updated → onUpdated
beforeUnmount → onBeforeUnmount
unmounted → onUnmounted
```

### 6. Props

```typescript
// Options API
props: {
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
}

// Composition API
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})
```

### 7. Emits

```typescript
// Options API
emits: ['update', 'close'],
methods: {
  handleClose() {
    this.$emit('close')
  }
}

// Composition API
const emit = defineEmits<{
  update: [value: string]
  close: []
}>()

function handleClose(): void {
  emit('close')
}
```

### 8. this.$refs

```typescript
// Options API
this.$refs.input.focus()

// Composition API
const inputRef = ref<HTMLInputElement | null>(null)
inputRef.value?.focus()
```

## Ejemplo Completo

### Antes (Options API)

```vue
<script>
  export default {
    name: 'UserCard',
    props: {
      user: {
        type: Object,
        required: true,
      },
    },
    emits: ['select'],
    data() {
      return {
        isExpanded: false,
      }
    },
    computed: {
      fullName() {
        return `${this.user.firstName} ${this.user.lastName}`
      },
    },
    methods: {
      toggle() {
        this.isExpanded = !this.isExpanded
      },
      handleSelect() {
        this.$emit('select', this.user.id)
      },
    },
    mounted() {
      console.log('Component mounted')
    },
  }
</script>
```

### Después (Composition API)

```vue
<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'

  interface User {
    id: number
    firstName: string
    lastName: string
  }

  interface Props {
    user: User
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    select: [userId: number]
  }>()

  const isExpanded = ref(false)

  const fullName = computed(() => `${props.user.firstName} ${props.user.lastName}`)

  function toggle(): void {
    isExpanded.value = !isExpanded.value
  }

  function handleSelect(): void {
    emit('select', props.user.id)
  }

  onMounted(() => {
    console.log('Component mounted')
  })
</script>
```

## Checklist de Conversión

- [ ] Cambiar `<script>` a `<script setup lang="ts">`
- [ ] Convertir `data()` a `ref()` o `reactive()`
- [ ] Convertir `computed` a `computed()`
- [ ] Convertir `methods` a funciones
- [ ] Convertir `watch` a `watch()`
- [ ] Convertir hooks de ciclo de vida
- [ ] Tipar props con interface
- [ ] Tipar emits con genéricos
- [ ] Eliminar `this.` (ya no es necesario)
- [ ] Añadir `.value` para acceder a refs
- [ ] Actualizar template si es necesario
