import { computed, reactive } from 'vue'
import type { Shift } from '../@types/shift'
import {
  hasShiftFieldErrors,
  validateShiftFields,
  type ShiftFieldErrors
} from './validators/shiftFields'

type ShiftFormContext = {
  shift?: Shift
  start: string
  end: string
}

export const useShiftForm = (initialContext: ShiftFormContext) => {
  const context = reactive<ShiftFormContext>({
    shift: initialContext.shift,
    start: initialContext.start,
    end: initialContext.end
  })

  const form = reactive({
    title: initialContext.shift?.title ?? '',
    notes: initialContext.shift?.notes ?? '',
    color: initialContext.shift?.color ?? '#dbeafe'
  })

  const errors = reactive<ShiftFieldErrors>({
    title: '',
    notes: '',
    start: '',
    end: ''
  })

  const isEditing = computed(() => Boolean(context.shift))

  const applyErrors = (nextErrors: ShiftFieldErrors) => {
    errors.title = nextErrors.title
    errors.notes = nextErrors.notes
    errors.start = nextErrors.start
    errors.end = nextErrors.end
  }

  const setContext = (nextContext: ShiftFormContext) => {
    context.shift = nextContext.shift
    context.start = nextContext.start
    context.end = nextContext.end
  }

  const reset = (nextContext: ShiftFormContext) => {
    setContext(nextContext)
    form.title = nextContext.shift?.title ?? ''
    form.notes = nextContext.shift?.notes ?? ''
    form.color = nextContext.shift?.color ?? '#dbeafe'
    applyErrors({
      title: '',
      notes: '',
      start: '',
      end: ''
    })
  }

  const validate = () => {
    const nextErrors = validateShiftFields({
      title: form.title,
      notes: form.notes,
      start: context.start,
      end: context.end
    })

    applyErrors(nextErrors)
    return !hasShiftFieldErrors(nextErrors)
  }

  const payload = computed(() => {
    const notes = form.notes.trim()

    return {
      title: form.title.trim(),
      notes: notes || undefined,
      color: form.color
    }
  })

  return {
    form,
    errors,
    isEditing,
    setContext,
    reset,
    validate,
    payload
  }
}
