import type { Role } from './auth'

export type User = {
  id: string
  name: string
  role: Role
}
