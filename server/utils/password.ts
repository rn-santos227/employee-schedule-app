import crypto from 'node:crypto'

const ITERATIONS = 100_000
const KEY_LENGTH = 32
const DIGEST = 'sha256'

export const hashPassword = (password: string, salt: string) =>
  crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex')

export const verifyPassword = (password: string, salt: string, expectedHash: string) => {
  const computedHash = hashPassword(password, salt)
  const computedBuffer = Buffer.from(computedHash, 'hex')
  const expectedBuffer = Buffer.from(expectedHash, 'hex')

  if (computedBuffer.length !== expectedBuffer.length) return false

  return crypto.timingSafeEqual(computedBuffer, expectedBuffer)
}
