<template>
  <div class="flex w-full flex-1 justify-center px-4 py-8">
    <div class="w-full max-w-6xl space-y-6">
      <BaseCard :title="cardTitle" subtitle="Drag to create shifts. Drag or resize existing cards to update timing.">
        <ScheduleCalendar
          :shifts="employeeShifts"
          :default-time-zone="employeeTimeZone"
          initial-mode="week"
          @shift-click="openEditModal"
          @shift-create="openCreateModal"
          @shift-update="handleShiftTimeUpdate"
        />
      </BaseCard>

      <ShiftFormModal
        v-if="isModalOpen"
        :shift="activeShift ?? undefined"
        :start="draftRange.start"
        :end="draftRange.end"
        @close="closeModal"
        @save="handleSave"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import type { Shift } from '../../../../@types/shift'
import adminMiddleware from '../../../../middleware/admin'
import { useShiftsStore } from '../../../../stores/shifts'
import { useUsersStore } from '../../../../stores/users'
import { useDialog } from '../../../../composables/useDialog'
import { useLoadingStore } from '../../../../stores/loading'
import { ROUTES } from '../../../../constants/routes'
import ShiftFormModal from '../../../../components/calendar/ShiftFormModal.vue'

definePageMeta({ middleware: [adminMiddleware] })

const route = useRoute()
const usersStore = useUsersStore()
const shiftsStore = useShiftsStore()
const loadingStore = useLoadingStore()
const { showDialog } = useDialog()

usersStore.ensureLoaded()
shiftsStore.ensureLoaded()

const employeeId = computed(() => String(route.params.id ?? ''))
const employeeTimeZone = computed(() => employee.value?.timezone ?? 'UTC')
const employee = computed(() => usersStore.byId(employeeId.value))

watchEffect(async () => {
  if (!employee.value || employee.value.role !== 'employee') {
    await navigateTo(ROUTES.adminUsers)
  }
})

const employeeShifts = computed(() => shiftsStore.byEmployeeId(employeeId.value))
const cardTitle = computed(() => `Schedule: ${employee.value?.name ?? 'Employee'}`)

const isModalOpen = ref(false)
const activeShift = ref<Shift | null>(null)
const draftRange = reactive({
  start: new Date().toISOString(),
  end: new Date(Date.now() + 60 * 60 * 1000).toISOString()
})

const openCreateModal = (range: { start: string; end: string }) => {
  activeShift.value = null
  draftRange.start = range.start
  draftRange.end = range.end
  isModalOpen.value = true
}

const openEditModal = (shift: Shift) => {
  activeShift.value = shift
  draftRange.start = shift.start
  draftRange.end = shift.end
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  activeShift.value = null
}

const handleSave = async (payload: { title: string; notes?: string; color: string }) => {
  const targetName = employee.value?.name ?? 'Employee'
  const isUpdate = Boolean(activeShift.value)

  loadingStore.start(isUpdate ? 'Updating shift...' : 'Creating shift...')

  try {
    if (isUpdate && activeShift.value) {
      shiftsStore.update(activeShift.value.id, {
        title: payload.title,
        notes: payload.notes,
        start: draftRange.start,
        end: draftRange.end,
        color: payload.color
      })
    } else {
      shiftsStore.create({
        employeeId: employeeId.value,
        employeeName: targetName,
        title: payload.title,
        notes: payload.notes,
        start: draftRange.start,
        end: draftRange.end,
        color: payload.color
      })
    }
  } finally {
    loadingStore.stop()
  }

  await showDialog({
    type: 'success',
    title: isUpdate ? 'Shift updated' : 'Shift assigned',
    message: `${payload.title} was ${isUpdate ? 'updated' : `assigned to ${targetName}`}.`,
    confirmLabel: 'Done'
  })

  closeModal()
}

const handleDelete = async () => {
  if (!activeShift.value) {
    return
  }

  const confirm = await showDialog({
    type: 'warning',
    title: 'Delete shift?',
    message: `Remove ${activeShift.value.title} from this employee schedule?`,
    confirmLabel: 'Delete'
  })

  if (!confirm.confirmed) {
    return
  }

  shiftsStore.remove(activeShift.value.id)
  closeModal()
}

const handleShiftTimeUpdate = (shift: Shift, patch: { start: string; end: string }) => {
  shiftsStore.update(shift.id, patch)
}
</script>
