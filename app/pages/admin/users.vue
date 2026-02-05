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
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { onMounted, ref } from 'vue'
import type { User } from '../../../@types/user'
import { useUsersStore } from '../../../stores/users'
import { useDialog } from '../../../composables/useDialog'
import adminMiddleware from '../../../middleware/admin'

definePageMeta({ middleware: [adminMiddleware] })

const usersStore = useUsersStore()
const { showDialog } = useDialog()

const isModalOpen = ref(false)
const activeUser = ref<User | null>(null)

const columns = [
  { key: 'name', label: 'Name', sortable: true, searchable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'timezone', label: 'Timezone' }
]

onMounted(() => {
  usersStore.load()
})

const openCreate = () => {
  activeUser.value = null
  isModalOpen.value = true
}

const openEdit = (user: User) => {
  activeUser.value = user
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  activeUser.value = null
}

const handleSave = (payload: Omit<User, 'id'>) => {
  const patch = { ...payload }
  if (activeUser.value && !patch.passwordPlain) {
    delete patch.passwordPlain
  }

  if (activeUser.value) {
    usersStore.update(activeUser.value.id, patch)
  } else {
    usersStore.create(patch)
  }

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
}
</script>
