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
          <BaseButton type="submit" variant="primary" size="lg" :disabled="isSubmitting" fullWidth>
            {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
          </BaseButton>
        </form>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { Role } from '../../@types/auth'
import { useAuthStore } from '../../stores/auth'
import { ROUTES } from '../../constants/routes'
import { useToast } from '../../composables/useToast'
import { useLoadingStore } from '../../stores/loading'
import { useUsersStore } from '../../stores/users'

const auth = useAuthStore()
const usersStore = useUsersStore()

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const loadingStore = useLoadingStore()
const { addToast } = useToast()

type LoginResponse = {
  userId: string
  role: Role
  name: string
}

const handleSubmit = async () => {
  if (!email.value || !password.value) {
    addToast({
      title: 'Missing credentials',
      message: 'Enter your email and password to continue.',
      variant: 'warning'
    })

    return
  }

  isSubmitting.value = true
  loadingStore.start('Signing you in...')

  const normalizedEmail = email.value.trim().toLowerCase()
  const normalizedPassword = password.value

  try {
    usersStore.ensureLoaded()
    const localUser = usersStore.users.find(
      (user) =>
        user.email.toLowerCase() === normalizedEmail &&
        user.passwordPlain &&
        user.passwordPlain === normalizedPassword
    )

    if (localUser) {
      auth.login(localUser.id, localUser.role)
      email.value = ''
      password.value = ''

      addToast({
        title: 'Signed in',
        message: `Welcome back, ${localUser.name}.`,
        variant: 'success'
      })

      await navigateTo(
        localUser.role === 'admin'
          ? ROUTES.adminUsers
          : ROUTES.employeeScheduleById(localUser.id)
      )
      return
    }

    const response = await $fetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: {
        email: normalizedEmail,
        password: normalizedPassword
      }
    })

    auth.login(response.userId, response.role)
    email.value = ''
    password.value = ''

    addToast({
      title: 'Signed in',
      message: `Welcome back, ${response.name}.`,
      variant: 'success'
    })

    await navigateTo(
      response.role === 'admin'
        ? ROUTES.adminUsers
        : ROUTES.employeeScheduleById(response.userId)
    )
  } catch (error) {
    addToast({
      title: 'Login failed',
      message: 'The credentials provided are not valid.',
      variant: 'error'
    })
  } finally {
    isSubmitting.value = false
    loadingStore.stop()
  }
}

onMounted(() => {
  usersStore.load()
})
</script>
