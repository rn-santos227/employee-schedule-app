<template>
  <header class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4">
      <div class="flex items-center gap-2 text-lg font-semibold text-slate-900">
        <span class="inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" aria-hidden="true" />
        Employee Schedule Portal
      </div>
      <div class="flex items-center gap-4">
        <p class="hidden text-sm text-slate-500 sm:block">Manage schedules in one place</p>
        <AppMenuDropdown v-if="auth.isAuthed" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
</script>
