export type Role = 'admin' | 'employee'

export type AuthState = {
  token: string | null
  userId: string | null
  role: Role | null
}
