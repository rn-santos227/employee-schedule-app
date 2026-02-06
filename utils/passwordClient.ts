const ITERATIONS = 100_000
const KEY_LENGTH_BITS = 256

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')

const fromHex = (hex: string) => {
  const normalized = hex.length % 2 === 0 ? hex : `0${hex}`
  const bytes = new Uint8Array(normalized.length / 2)

  for (let index = 0; index < normalized.length; index += 2) {
    bytes[index / 2] = Number.parseInt(normalized.slice(index, index + 2), 16)
  }

  return bytes
}

export const createPasswordSalt = () => {
  if (typeof window === 'undefined') {
    return ''
  }

  const bytes = new Uint8Array(16)
  window.crypto.getRandomValues(bytes)
  return toHex(bytes.buffer)
}

export const hashPassword = async (password: string, saltHex: string) => {
  if (typeof window === 'undefined') {
    return ''
  }

  const encoder = new TextEncoder()
  const key = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )

  const derivedBits = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: fromHex(saltHex),
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    key,
    KEY_LENGTH_BITS
  )

  return toHex(derivedBits)
}
