import { defineStore } from 'pinia'
import type { User } from '../@types/user'

const defaultUsers: User[] = [
  { id: 'u-admin', name: 'Alex Admin', role: 'admin' },
  { id: 'u-employee-1', name: 'Erin Employee', role: 'employee' },
  { id: 'u-employee-2', name: 'Sam Scheduler', role: 'employee' }
]

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: defaultUsers
  })
})
