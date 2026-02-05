import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuthStore } from '../stores/auth'
import { ROUTES } from '../constants/routes'

export default defineNuxtRouteMiddleware(() => {
  if (process.server) return

  const auth = useAuthStore()
  auth.load()

  if (!auth.isAuthed) {
    return navigateTo(ROUTES.login)
  }

  if (!auth.isAdmin) {
    return navigateTo(ROUTES.employeeSchedule)
  }
})
