<template>
  <div class="flex w-full flex-1 items-center justify-center px-4 py-12">
    <div class="flex w-full max-w-2xl flex-col gap-6">
      <BaseCard
        title="Employee Schedule Portal"
        subtitle="Sign in to manage employee schedules."
        class="w-full"
      >
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <BaseTextField
            v-model="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            :disabled="isSubmitting"
            required
          />
          <BaseTextField
            v-model="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            :disabled="isSubmitting"
            required
          />
          <p v-if="formError" class="text-sm text-rose-600">
            {{ formError }}
          </p>
          <BaseButton type="submit" variant="primary" size="lg" :disabled="isSubmitting" fullWidth>
            {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
          </BaseButton>
        </form>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Role } from '../../@types/auth'
import { useAuthStore } from '../../stores/auth'
import { ROUTES } from '../../constants/routes'

const auth = useAuthStore()

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const formError = ref('')

type LoginResponse = {
  userId: string
  role: Role
  name: string
}

const handleSubmit = async () => {
  formError.value = ''

  if (!email.value || !password.value) {
    formError.value = 'Enter your email and password.'
    return
  }

  isSubmitting.value = true

  try {
    const response = await $fetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    auth.login(response.userId, response.role)
    email.value = ''
    password.value = ''

    await navigateTo(
      response.role === 'admin' ? ROUTES.adminSchedule : ROUTES.employeeSchedule
    )
  } catch (error) {
    formError.value = 'The credentials provided are not valid.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
