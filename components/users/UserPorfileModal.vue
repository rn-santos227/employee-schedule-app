<template>
  <BaseModal
    title="My profile"
    description="Your account information"
    size="sm"
    @close="emit('close')"
  >
    <div class="space-y-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</p>
        <p class="mt-1 text-sm text-slate-900">{{ user.name }}</p>
      </div>

      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
        <p class="mt-1 text-sm text-slate-900">{{ user.email }}</p>
      </div>

      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</p>
        <p class="mt-1">
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
            {{ user.role }}
          </span>
        </p>
      </div>

      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Timezone</p>
        <p class="mt-1 text-sm text-slate-900">{{ user.timezone ?? '—' }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <BaseButton variant="secondary" @click="emit('close')">Close</BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import type { User } from '../../@types/user'

defineProps<{
  user: User
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()
</script>
