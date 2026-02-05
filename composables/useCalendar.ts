import { computed, ref, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { CalendarMode, Shift } from '../@types/shift'

type UseCalendarOptions = {
  shifts: MaybeRefOrGetter<Readonly<Shift[]>>
  initialMode?: CalendarMode
}

export const useCalendar = ({ shifts, initialMode = 'week' }: UseCalendarOptions) => {
  const modes: CalendarMode[] = ['day', 'week', 'month']
  const modeLabels: Record<CalendarMode, string> = { day: 'Day', week: 'Week', month: 'Month' }
  const weekdayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const hours = Array.from({ length: 24 }, (_, hour) => hour)

  const activeMode = ref<CalendarMode>(initialMode)
  const activeDate = ref(new Date())

  const weekDays = computed(() => {
    const start = startOfWeek(activeDate.value)
    return Array.from({ length: 7 }, (_, index) => addDays(start, index))
  })

  const monthGrid = computed(() => {
    const firstDayOfMonth = new Date(activeDate.value.getFullYear(), activeDate.value.getMonth(), 1)
    const gridStart = startOfWeek(firstDayOfMonth)

    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
  })

  const shiftsByDayKey = computed(() => {
    return toValue(shifts).reduce<Record<string, Shift[]>>((acc, shift) => {
      const key = dayKey(new Date(shift.start))
      acc[key] ??= []
      acc[key].push(shift)
      return acc
    }, {})
  })

  const dayShifts = computed(() => {
    const key = dayKey(activeDate.value)
    return (shiftsByDayKey.value[key] ?? []).sort(sortByStart)
  })

  const periodLabel = computed(() => {
    if (activeMode.value === 'day') {
      return `${formatWeekday(activeDate.value)}, ${activeDate.value.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })}`
    }

    if (activeMode.value === 'week') {
      const start = weekDays.value[0] ?? activeDate.value
      const end = weekDays.value[6] ?? start
      return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })}`
    }

    return activeDate.value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  })

  const goToPrevious = () => {
    if (activeMode.value === 'day') {
      activeDate.value = addDays(activeDate.value, -1)
      return
    }

    if (activeMode.value === 'week') {
      activeDate.value = addDays(activeDate.value, -7)
      return
    }

    activeDate.value = new Date(activeDate.value.getFullYear(), activeDate.value.getMonth() - 1, 1)
  }

  const goToNext = () => {
    if (activeMode.value === 'day') {
      activeDate.value = addDays(activeDate.value, 1)
      return
    }

    if (activeMode.value === 'week') {
      activeDate.value = addDays(activeDate.value, 7)
      return
    }

    activeDate.value = new Date(activeDate.value.getFullYear(), activeDate.value.getMonth() + 1, 1)
  }

  const goToToday = () => {
    activeDate.value = new Date()
  }

  return {
    modes,
    modeLabels,
    weekdayHeaders,
    hours,
    activeMode,
    activeDate,
    weekDays,
    monthGrid,
    shiftsByDayKey,
    dayShifts,
    periodLabel,
    goToPrevious,
    goToNext,
    goToToday,
    dayKey,
    shiftStyle,
    formatWeekday,
    formatMonthDay,
    formatHour,
    formatHourMinute,
    formatTimeRange,
    isSameMonth,
    isToday
  }
}

const shiftStyle = (shift: Shift, dayHeight = 960) => {
  const start = new Date(shift.start)
  const end = new Date(shift.end)
  const top = ((start.getHours() * 60 + start.getMinutes()) / (24 * 60)) * dayHeight
  const durationMinutes = Math.max(30, (end.getTime() - start.getTime()) / 60000)
  const height = (durationMinutes / (24 * 60)) * dayHeight

  return {
    top: `${top}px`,
    height: `${height}px`,
    backgroundColor: shift.color ?? '#dbeafe',
    borderColor: shift.color ?? '#bfdbfe'
  }
}

const dayKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const startOfWeek = (date: Date) => {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  copy.setDate(copy.getDate() - copy.getDay())
  return copy
}

const addDays = (date: Date, days: number) => {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

const sortByStart = (a: Shift, b: Shift) => new Date(a.start).getTime() - new Date(b.start).getTime()

const formatWeekday = (date: Date, short = false) =>
  date.toLocaleDateString(undefined, { weekday: short ? 'short' : 'long' })

const formatMonthDay = (date: Date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

const formatHour = (hour: number) => {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const normalized = hour % 12 || 12
  return `${normalized}${suffix}`
}

const formatHourMinute = (isoDate: string) =>
  new Date(isoDate).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

const formatTimeRange = (startIso: string, endIso: string) => `${formatHourMinute(startIso)} - ${formatHourMinute(endIso)}`

const isSameMonth = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth()

const isToday = (date: Date) => {
  const today = new Date()
  return dayKey(today) === dayKey(date)
}
