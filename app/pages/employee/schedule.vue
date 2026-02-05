<template>
  <div class="flex w-full flex-1 justify-center px-4 py-8">
    <div class="w-full max-w-6xl">
      <BaseCard title="My schedule" subtitle="View your assigned shifts across day, week, and month.">
        <ScheduleCalendar :shifts="myShifts" :readonly="true" initial-mode="week" />
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Shift } from '../../../@types/shift'
import { useAuthStore } from '../../../stores/auth'
import { useShiftsStore } from '../../../stores/shifts'

const auth = useAuthStore()
const shiftsStore = useShiftsStore()

shiftsStore.ensureLoaded()

const myShifts = computed<Shift[]>(() => {
  if (!auth.userId) {
    return []
  }

  return shiftsStore.byEmployeeId(auth.userId)
})
</script>
