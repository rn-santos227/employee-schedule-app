<template>
  <div class="flex w-full flex-1 items-center justify-center text-sm text-slate-500">
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

  await navigateTo(auth.isAdmin ? ROUTES.adminUsers : ROUTES.employeeSchedule)
})
</script>
