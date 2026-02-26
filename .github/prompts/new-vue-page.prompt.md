---
name: new-vue-page
description: Creates a new page/view component with routing
version: 1.0.0
---

# Create New Vue Page

Crea una nueva página/vista Vue con todos los elementos necesarios.

## Instrucciones

Por favor proporciona:

1. **Nombre de la página**: (ej: "Dashboard", "UserProfile", "Settings")
2. **Ruta URL**: (ej: "/dashboard", "/user/:id", "/settings")
3. **Meta title**: Título para la pestaña del navegador
4. **¿Requiere autenticación?**: Sí/No

## Necesito generar:

### 1. Vista (src/views/{Name}View.vue)

```vue
<script setup lang="ts">
  // imports necesarios
</script>

<template>
  <div class="{name}-view">
    <h1 class="page-title">{Title}</h1>
    <!-- Contenido de la página -->
  </div>
</template>

<style scoped>
  .{name}-view {
    @apply container mx-auto px-4 py-8;
  }

  .page-title {
    @apply text-3xl font-bold mb-6;
  }
</style>
```

### 2. Actualizar Router (src/router/index.ts)

Añadir la nueva ruta con lazy-loading:

```typescript
{
  path: '/{path}',
  name: '{name}',
  component: () => import('@/views/{Name}View.vue'),
  meta: {
    title: '{Meta Title}',
    requiresAuth: false // o true si requiere auth
  }
}
```

### 3. Test (src/views/{Name}View.spec.ts)

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import {Name}View from './{Name}View.vue'

describe('{Name}View', () => {
  it('renders page title', () => {
    const wrapper = mount({Name}View)
    expect(wrapper.find('h1').text()).toContain('{Title}')
  })
})
```

## Ejemplo de Uso

**Input**:

- Nombre: "UserProfile"
- Ruta: "/user/:id"
- Meta: "User Profile"
- Auth: Sí

**Output**: Genera los 3 archivos con la estructura correcta.
