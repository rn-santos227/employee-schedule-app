<template>
  <div class="flex w-full flex-1 justify-center px-4 py-8">
    <div class="w-full max-w-6xl">
      <BaseCard :title="cardTitle" subtitle="View assigned shifts across day, week, and month.">
        <ScheduleCalendar :shifts="employeeShifts" :default-time-zone="employeeTimeZone" :readonly="true" initial-mode="week" />
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { ROUTES } from '../../../../constants/routes'
import { useAuthStore } from '../../../../stores/auth'
import { useShiftsStore } from '../../../../stores/shifts'
import { useUsersStore } from '../../../../stores/users'

const route = useRoute()
const auth = useAuthStore()
const usersStore = useUsersStore()
const shiftsStore = useShiftsStore()

auth.load()
usersStore.ensureLoaded()
shiftsStore.ensureLoaded()

const pageEmployeeId = computed(() => String(route.params.id ?? ''))
const employee = computed(() => usersStore.byId(pageEmployeeId.value))

watchEffect(async () => {
  if (!auth.userId) {
    await navigateTo(ROUTES.login)
    return
  }

  const isAdmin = auth.isAdmin
  const isOwnPage = pageEmployeeId.value === auth.userId

  if (!isAdmin && !isOwnPage) {
    await navigateTo(ROUTES.employeeScheduleById(auth.userId))
    return
  }

  if (!employee.value || employee.value.role !== 'employee') {
    await navigateTo(isAdmin ? ROUTES.adminUsers : ROUTES.employeeScheduleById(auth.userId))
  }
})

const employeeShifts = computed(() => shiftsStore.byEmployeeId(pageEmployeeId.value))
const employeeTimeZone = computed(() => employee.value?.timezone ?? 'UTC')
const cardTitle = computed(() => {
  if (auth.isAdmin) {
    return `Employee schedule: ${employee.value?.name ?? 'Employee'}`
  }

  return 'My schedule'
})
</script>
