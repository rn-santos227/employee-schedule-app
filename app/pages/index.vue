<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
    Redirecting…
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { ROUTES } from '../../constants/routes'

const auth = useAuthStore()

onMounted(async () => {
  auth.load()

  if (!auth.isAuthed) {
    await navigateTo(ROUTES.login)
    return
  }

  await navigateTo(auth.isAdmin ? ROUTES.adminSchedule : ROUTES.employeeSchedule)
})
</script>
