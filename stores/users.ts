import { defineStore } from 'pinia'
import type { User } from '../@types/user'
import usersData from '../data/users.json'

const STORAGE_KEY = 'ms_users'
const seedUsers = usersData as User[]

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [] as User[],
    loaded: false
  }),

  getters: {
    byId: (state) => (id: string) => state.users.find((user) => user.id === id),
    employees: (state) => state.users.filter((user) => user.role === 'employee')
  },

  actions: {
    ensureLoaded() {
      if (this.loaded) return
      this.load()
    },

    load() {
      if (this.loaded) return
      this.loaded = true

      if (typeof window === 'undefined') return

      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        this.users = [...seedUsers]
        this.persist()
        return
      }

      try {
        const parsed = JSON.parse(raw) as User[]
        if (!Array.isArray(parsed)) {
          throw new Error('Invalid users payload')
        }
        this.users = parsed
      } catch {
        localStorage.removeItem(STORAGE_KEY)
        this.users = [...seedUsers]
        this.persist()
      }
    },

    persist() {
      if (typeof window === 'undefined') return
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.users))
    },

    create(user: Omit<User, 'id'>) {
      this.ensureLoaded()
      const newUser: User = {
        ...user,
        id: crypto.randomUUID()
      }
      this.users = [...this.users, newUser]
      this.persist()
      return newUser
    },
  },
})
