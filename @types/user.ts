import type { Role } from './auth'

export type User = {
  id: string
  email: string
  name: string
  role: Role
}
