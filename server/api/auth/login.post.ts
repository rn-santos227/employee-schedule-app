import { createError, readBody } from 'h3'
import type { User } from '../../../@types/user'
import usersData from '../../../data/users.json'
import { verifyPassword } from '../../utils/password'

type UserRecord = User & {
  passwordSalt: string
  passwordHash: string
}

type Role = User['role']

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email ?? '').trim().toLowerCase()
  const password = String(body?.password ?? '')

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing credentials.' })
  }

  const users = usersData as UserRecord[]
  const user = users.find((entry) => entry.email.toLowerCase() === email)

  if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials.' })
  }

  return {
    userId: user.id,
    role: user.role as Role,
    name: user.name
  }
})
