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
})
