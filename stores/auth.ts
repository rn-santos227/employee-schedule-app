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

  getters: {
    isAuthed: (state) => Boolean(state.token),
    isAdmin: (state) => state.role === 'admin'
  },

  actions: {
    load() {
      if (hasLoaded) return
      hasLoaded = true

      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return

      try {
        const parsed = JSON.parse(raw) as Partial<AuthState>
        this.token = parsed.token ?? null
        this.userId = parsed.userId ?? null
        this.role = parsed.role ?? null
      } catch {
        localStorage.removeItem(STORAGE_KEY)
        this.token = null
        this.userId = null
        this.role = null
      }
    },

    login(userId: string, role: Role) {
      this.token = crypto.randomUUID()
      this.userId = userId
      this.role = role
      hasLoaded = true

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          token: this.token,
          userId: this.userId,
          role: this.role
        })
      )
    },
  },
})
