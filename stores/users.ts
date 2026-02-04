import { defineStore } from 'pinia'
import type { User } from '../@types/user'
import usersData from '../data/users.json'

const defaultUsers = usersData as User[]

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: defaultUsers
  })
})
