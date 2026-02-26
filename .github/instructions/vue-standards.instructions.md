# Vue Coding Standards

Estas instrucciones definen los estándares de código específicos para este proyecto Vue.js.

## Principios Fundamentales

1. **Composition API primero**: Nunca uses Options API
2. **TypeScript estricto**: No `any`, no `@ts-ignore`
3. **Componentes pequeños**: Máximo 200 líneas por componente
4. **Single Responsibility**: Un componente = una responsabilidad

## Checklist para Nuevos Componentes

- [ ] `<script setup lang="ts">`
- [ ] Props tipadas con `defineProps<Props>()`
- [ ] Emits tipados con `defineEmits<Emits>()`
- [ ] Estilos con `scoped`
- [ ] Nombre en PascalCase
- [ ] Test unitario correspondiente

## Imports

Ordena los imports de esta manera:

1. Vue core (`vue`, `vue-router`, `pinia`)
2. Librerías externas
3. Componentes (absolutos con `@/`)
4. Composables
5. Stores
6. Types
7. Utils/Constants

```typescript
// 1. Vue core
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 2. External libraries
import { format } from 'date-fns'

// 3. Components
import BaseButton from '@/components/ui/BaseButton.vue'

// 4. Composables
import { useLocalStorage } from '@/composables/useLocalStorage'

// 5. Stores
import { useUserStore } from '@/stores/user'

// 6. Types
import type { User } from '@/types/user'

// 7. Utils
import { formatCurrency } from '@/utils/format'
```

## Reactive State

```typescript
// ✅ Usa ref para primitivos
const count = ref(0)
const name = ref('')

// ✅ Usa reactive para objetos complejos
const form = reactive({
  email: '',
  password: '',
  rememberMe: false,
})

// ✅ Usa shallowRef para objetos grandes que cambian completamente
const data = shallowRef(largeObject)
```

## Computed vs Methods

```typescript
// ✅ Usa computed para valores derivados
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// ✅ Usa functions para operaciones con efectos secundarios
function saveUser(): void {
  api.save(user.value)
}
```
