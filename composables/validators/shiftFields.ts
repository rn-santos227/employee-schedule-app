export type ShiftFieldInput = {
  title: string
  notes: string
  start: string
  end: string
}

export type ShiftFieldErrors = {
  title: string
  notes: string
  start: string
  end: string
}

const emptyErrors = (): ShiftFieldErrors => ({
  title: '',
  notes: '',
  start: '',
  end: ''
})

export const validateShiftFields = (input: ShiftFieldInput): ShiftFieldErrors => {
  const errors = emptyErrors()
  const title = input.title.trim()
  const notes = input.notes.trim()

  if (!title) {
    errors.title = 'Shift name is required.'
  } else if (title.length > 80) {
    errors.title = 'Shift name must be 80 characters or fewer.'
  }

  if (notes.length > 500) {
    errors.notes = 'Notes must be 500 characters or fewer.'
  }

  const start = new Date(input.start)
  const end = new Date(input.end)

  if (Number.isNaN(start.getTime())) {
    errors.start = 'Invalid shift start time.'
  }

  if (Number.isNaN(end.getTime())) {
    errors.end = 'Invalid shift end time.'
  }

  if (!errors.start && !errors.end && end.getTime() <= start.getTime()) {
    errors.end = 'Shift end must be after shift start.'
  }

  if (!errors.start && !errors.end) {
    const durationMinutes = (end.getTime() - start.getTime()) / 60000
    if (durationMinutes < 30) {
      errors.end = 'Shift must be at least 30 minutes.'
    }
  }

  return errors
}

export const hasShiftFieldErrors = (errors: ShiftFieldErrors) =>
  Object.values(errors).some((message) => Boolean(message))
