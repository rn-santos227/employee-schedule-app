export type UserFieldErrors = {
  name: string
  email: string
  role: string
  passwordPlain: string
}

export type UserFieldInput = {
  name: string
  email: string
  role: string
  passwordPlain: string
  isEditing: boolean
}

const emptyErrors = (): UserFieldErrors => ({
  name: '',
  email: '',
  role: '',
  passwordPlain: ''
})

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export const validateUserFields = (input: UserFieldInput): UserFieldErrors => {
  const errors = emptyErrors()

  if (!input.name.trim()) {
    errors.name = 'Name is required.'
  }

  if (!input.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!isValidEmail(input.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!['admin', 'employee'].includes(input.role)) {
    errors.role = 'Select a valid role.'
  }

  if (!input.isEditing && !input.passwordPlain.trim()) {
    errors.passwordPlain = 'Password is required when creating a user.'
  }

  return errors
}

export const hasUserFieldErrors = (errors: UserFieldErrors) =>
  Object.values(errors).some((message) => Boolean(message))
