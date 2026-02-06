<template>
  <div class="flex w-full flex-1 justify-center px-4 py-8">
    <div class="w-full max-w-5xl space-y-6">
      <BaseCard title="User management" subtitle="Create and manage admin or employee profiles.">
        <DataTable :columns="columns" :rows="usersStore.users">
          <template #table-actions>
            <BaseButton variant="primary" @click="openCreate">Create user</BaseButton>
          </template>
          <template #cell-role="{ value }">
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
              {{ String(value) }}
            </span>
          </template>
          <template #cell-timezone="{ value }">
            <span class="text-slate-600">
              {{ value ? String(value) : '—' }}
            </span>
          </template>
          <template #row-actions="{ row }">
            <div class="flex items-center justify-end gap-2">
              <BaseButton
                variant="secondary"
                size="sm"
                icon-only
                :icon="CalendarDaysIcon"
                aria-label="Open schedule"
                @click="openSchedule(row as User)"
              />
              <BaseButton
                variant="secondary"
                size="sm"
                icon-only
                :icon="PencilSquareIcon"
                aria-label="Edit user"
                @click="openEdit(row as User)"
              />
              <BaseButton
                variant="danger"
                size="sm"
                icon-only
                :icon="TrashIcon"
                aria-label="Delete user"
                @click="handleDelete(row as User)"
              />
            </div>
          </template>
        </DataTable>
      </BaseCard>

      <UserFormModal
        v-if="isModalOpen"
        :user="activeUser ?? undefined"
        @close="closeModal"
        @save="handleSave"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDaysIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { computed, onMounted, ref } from 'vue'
import { navigateTo } from 'nuxt/app'
import type { User } from '../../../@types/user'
import { useUsersStore } from '../../../stores/users'
import { useDialog } from '../../../composables/useDialog'
import { useLoadingStore } from '../../../stores/loading'
import { useAuthStore } from '../../../stores/auth'
import adminMiddleware from '../../../middleware/admin'
import { ROUTES } from '../../../constants/routes'

definePageMeta({ middleware: [adminMiddleware] })

const usersStore = useUsersStore()
const authStore = useAuthStore()
const { showDialog } = useDialog()
const loadingStore = useLoadingStore()

const isModalOpen = ref(false)
const activeUser = ref<User | null>(null)

const columns = [
  { key: 'name', label: 'Name', sortable: true, searchable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'timezone', label: 'Timezone' }
]

onMounted(() => {
  authStore.load()
  usersStore.load()
})

const managedUsers = computed(() =>
  usersStore.users.filter((user) => user.id !== authStore.userId)
)

const openCreate = () => {
  activeUser.value = null
  isModalOpen.value = true
}

const openEdit = (user: User) => {
  activeUser.value = user
  isModalOpen.value = true
}

const openSchedule = (user: User) => {
  navigateTo(ROUTES.adminScheduleByEmployeeId(user.id))
}

const closeModal = () => {
  isModalOpen.value = false
  activeUser.value = null
}

const handleSave = async (payload: Omit<User, 'id'>) => {
  const patch = { ...payload }
  if (activeUser.value && !patch.passwordPlain) {
    delete patch.passwordPlain
  }

  const isUpdate = Boolean(activeUser.value)
  const targetName = (isUpdate ? activeUser.value?.name : patch.name) ?? 'this user'

  const confirmation = await showDialog({
    type: 'question',
    title: isUpdate ? 'Update user?' : 'Create user?',
    message: isUpdate
      ? `Save changes for ${targetName}?`
      : `Create a new user profile for ${targetName}?`,
    confirmLabel: isUpdate ? 'Save' : 'Create'
  })

  if (!confirmation.confirmed) {
    return
  }

  loadingStore.start(isUpdate ? 'Updating employee profile...' : 'Creating employee profile...')

  try {
    if (isUpdate && activeUser.value) {
      usersStore.update(activeUser.value.id, patch)
    } else {
      usersStore.create(patch)
    }
  } finally {
    loadingStore.stop()
  }

  await showDialog({
    type: 'success',
    title: isUpdate ? 'User updated' : 'User created',
    message: `${targetName} has been ${isUpdate ? 'updated' : 'created'} successfully.`,
    confirmLabel: 'Done'
  })

  closeModal()
}

const handleDelete = async (user: User) => {
  const result = await showDialog({
    type: 'warning',
    title: 'Delete user?',
    message: `This will permanently remove ${user.name}.`,
    confirmLabel: 'Delete'
  })

  if (!result.confirmed) {
    return
  }

  usersStore.remove(user.id)

  await showDialog({
    type: 'success',
    title: 'User deleted',
    message: `${user.name} has been removed.`,
    confirmLabel: 'Done'
  })
}
</script>
