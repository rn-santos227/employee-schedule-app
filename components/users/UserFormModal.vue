<template>
  <BaseModal :title="modalTitle" :description="modalDescription" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <BaseTextField
        v-model="form.name"
        label="Name"
        placeholder="Full name"
        :error="errors.name"
        required
      />
      <BaseTextField
        v-model="form.email"
        type="email"
        label="Email"
        placeholder="name@example.com"
        :error="errors.email"
        required
      />
      <BaseSelect
        v-model="form.role"
        label="Role"
        :options="roleOptions"
        :error="errors.role"
        required
      />
      <div class="space-y-1">
        <label for="user-timezone" class="text-sm font-medium text-slate-700">Timezone</label>
        <input
          id="user-timezone"
          v-model="form.timezone"
          list="timezones-list"
          type="text"
          placeholder="Select or type a timezone"
          class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus-visible:border-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        />
        <datalist id="timezones-list">
          <option v-for="timezone in timezoneOptions" :key="timezone" :value="timezone" />
        </datalist>
        <p class="text-sm text-slate-500">Optional</p>
      </div>
      <BaseTextField
        v-model="form.passwordPlain"
        type="password"
        label="Password"
        placeholder="Set a temporary password"
        :helper-text="passwordHelper"
        :error="errors.passwordPlain"
        :required="!isEditing"
      />
    </form>
    <template #footer>
      <div class="flex flex-wrap justify-end gap-3">
        <BaseButton variant="secondary" @click="emit('close')">Cancel</BaseButton>
        <BaseButton type="button" variant="primary" @click="handleSubmit">
          {{ isEditing ? 'Save changes' : 'Create user' }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { Role } from '../../@types/auth'
import type { User } from '../../@types/user'
import { 
  hasUserFieldErrors,
  validateUserFields,
  type UserFieldErrors
} from '../../composables/validators/userFields'

import timezones from '../../data/tomezones.json'
import BaseButton from '../ui/BaseButton.vue'
import BaseModal from '../ui/BaseModal.vue'
import BaseSelect from '../ui/BaseSelect.vue'
import BaseTextField from '../ui/BaseTextField.vue'

type UserFormModel = {
  name: string
  email: string
  role: Role
  timezone: string
  passwordPlain: string
}

const props = defineProps<{
  user?: User
}>()

const emit = defineEmits<{
  (event: 'save', value: Omit<User, 'id'>): void
  (event: 'close'): void
}>()

const form = reactive<UserFormModel>({
  name: '',
  email: '',
  role: 'employee',
  timezone: '',
  passwordPlain: ''
})

const errors = reactive<UserFieldErrors>({
  name: '',
  email: '',
  role: '',
  passwordPlain: ''
})

const timezoneOptions = timezones as string[]

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Employee', value: 'employee' }
]

const isEditing = computed(() => Boolean(props.user))

const modalTitle = computed(() => (isEditing.value ? 'Edit user' : 'Create user'))
const modalDescription = computed(() =>
  isEditing.value ? 'Update the user profile details.' : 'Add a new team member profile.'
)
const passwordHelper = computed(() =>
  isEditing.value ? 'Leave blank to keep the current password.' : 'Required for new users.'
)

const applyErrors = (nextErrors: UserFieldErrors) => {
  errors.name = nextErrors.name
  errors.email = nextErrors.email
  errors.role = nextErrors.role
  errors.passwordPlain = nextErrors.passwordPlain
}

const clearErrors = () => {
  applyErrors({
    name: '',
    email: '',
    role: '',
    passwordPlain: ''
  })
}

const resetForm = (user?: User) => {
  form.name = user?.name ?? ''
  form.email = user?.email ?? ''
  form.role = user?.role ?? 'employee'
  form.timezone = user?.timezone ?? ''
  form.passwordPlain = ''
  clearErrors()
}

const handleSubmit = () => {
  const nextErrors = validateUserFields({
    name: form.name,
    email: form.email,
    role: form.role,
    passwordPlain: form.passwordPlain,
    isEditing: isEditing.value
  })

  applyErrors(nextErrors)

  if (hasUserFieldErrors(nextErrors)) {
    return
  }

  const payload: Omit<User, 'id'> = {
    name: form.name.trim(),
    email: form.email.trim(),
    role: form.role,
    timezone: form.timezone.trim() || undefined,
    passwordPlain: form.passwordPlain.trim() || undefined
  }

  emit('save', payload)
}

watch(
  () => props.user,
  (next) => {
    resetForm(next)
  },
  { immediate: true }
)
</script>
