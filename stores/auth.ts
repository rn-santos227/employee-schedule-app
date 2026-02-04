import { defineStore } from 'pinia'
import type { AuthState, Role } from '../@types/auth'

const STORAGE_KEY = 'ms_auth'
let hasLoaded = false

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    userId: null,
    role: null
  }),
})
