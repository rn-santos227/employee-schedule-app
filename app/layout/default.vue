<template>
  <div class="flex min-h-screen flex-col bg-slate-50 text-slate-900">
    <AppHeader />
    <main class="flex flex-1">
      <slot />
    </main>
    <AppFooter />
    <ToastStack />
  </div>
</template>

<script setup lang="ts">
import ToastStack from '../../components/ui/ToastStack.vue'
</script>
