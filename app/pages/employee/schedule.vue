<template>
  <div class="flex w-full flex-1 items-center justify-center px-4 py-8">
    <BaseCard title="Redirecting" subtitle="Loading your schedule..." />
  </div>
</template>

<script setup lang="ts">
import { watchEffect } from 'vue'
import { ROUTES } from '../../../constants/routes'
import { useAuthStore } from '../../../stores/auth'

const auth = useAuthStore()
auth.load()

watchEffect(async () => {
  if (!auth.userId) {
    await navigateTo(ROUTES.login)
    return
  }
  await navigateTo(ROUTES.employeeScheduleById(auth.userId), { replace: true })
})
</script>
