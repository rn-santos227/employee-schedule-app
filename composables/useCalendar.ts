import { computed, ref, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { CalendarMode, Shift } from '../@types/shift'
import {
  addDaysInTimeZone,
  addMonthsInTimeZone,
  formatDateInTimeZone,
  formatTimeInTimeZone,
  getDayKeyInTimeZone,
  getMinutesInTimeZoneDay,
  getStartOfMonthInTimeZone,
  getStartOfWeekInTimeZone,
  normalizeTimeZone,
  zonedDateTimeToUtc
} from '../utils/timezone'

type UseCalendarOptions = {
  shifts: MaybeRefOrGetter<Readonly<Shift[]>>
  initialMode?: CalendarMode
  timeZone?: MaybeRefOrGetter<string>
}

export const useCalendar = ({ shifts, initialMode = 'week', timeZone }: UseCalendarOptions) => {
  const modes: CalendarMode[] = ['day', 'week', 'month']
  const modeLabels: Record<CalendarMode, string> = { day: 'Day', week: 'Week', month: 'Month' }
  const weekdayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const hours = Array.from({ length: 24 }, (_, hour) => hour)

  const activeMode = ref<CalendarMode>(initialMode)
  const activeDate = ref(new Date())
  const normalizedTimeZone = computed(() => normalizeTimeZone(toValue(timeZone) ?? 'UTC'))

  const weekDays = computed(() => {
    const start = getStartOfWeekInTimeZone(activeDate.value, normalizedTimeZone.value)
    return Array.from({ length: 7 }, (_, index) => addDaysInTimeZone(start, index, normalizedTimeZone.value))
  })

  const monthGrid = computed(() => {
    const firstDayOfMonth = getStartOfMonthInTimeZone(activeDate.value, normalizedTimeZone.value)
    const gridStart = getStartOfWeekInTimeZone(firstDayOfMonth, normalizedTimeZone.value)

    return Array.from({ length: 42 }, (_, index) => addDaysInTimeZone(gridStart, index, normalizedTimeZone.value))
  })

  const shiftsByDayKey = computed(() => {
    return toValue(shifts).reduce<Record<string, Shift[]>>((acc, shift) => {
      const key = dayKey(new Date(shift.start), normalizedTimeZone.value)
      acc[key] ??= []
      acc[key].push(shift)
      return acc
    }, {})
  })

  const dayShifts = computed(() => {
    const key = dayKey(activeDate.value, normalizedTimeZone.value)
    return (shiftsByDayKey.value[key] ?? []).sort((a, b) => sortByStart(a, b, normalizedTimeZone.value))
  })

  const periodLabel = computed(() => {
    if (activeMode.value === 'day') {
      return `${formatWeekday(activeDate.value, normalizedTimeZone.value)}, ${formatDateInTimeZone(activeDate.value, normalizedTimeZone.value, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })}`
    }

    if (activeMode.value === 'week') {
      const start = weekDays.value[0] ?? activeDate.value
      const end = weekDays.value[6] ?? start
      return `${formatDateInTimeZone(start, normalizedTimeZone.value, { month: 'short', day: 'numeric' })} - ${formatDateInTimeZone(
        end,
        normalizedTimeZone.value,
        {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }
      )}`
    }

    return formatDateInTimeZone(activeDate.value, normalizedTimeZone.value, { month: 'long', year: 'numeric' })
  })

  const goToPrevious = () => {
    if (activeMode.value === 'day') {
      activeDate.value = addDaysInTimeZone(activeDate.value, -1, normalizedTimeZone.value)
      return
    }

    if (activeMode.value === 'week') {
      activeDate.value = addDaysInTimeZone(activeDate.value, -7, normalizedTimeZone.value)
      return
    }

    activeDate.value = addMonthsInTimeZone(activeDate.value, -1, normalizedTimeZone.value)
  }

  const goToNext = () => {
    if (activeMode.value === 'day') {
      activeDate.value = addDaysInTimeZone(activeDate.value, 1, normalizedTimeZone.value)
      return
    }

    if (activeMode.value === 'week') {
      activeDate.value = addDaysInTimeZone(activeDate.value, 7, normalizedTimeZone.value)
      return
    }

    activeDate.value = addMonthsInTimeZone(activeDate.value, 1, normalizedTimeZone.value)
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
    formatWeekday,
    formatMonthDay,
    formatHour,
    formatHourMinute,
    isSameMonth,
    isToday,
    toIsoInTimeZone: (baseDate: Date, minutes: number) => withMinutes(baseDate, minutes, normalizedTimeZone.value)
  }
}

const dayKey = (date: Date, timeZone = 'UTC') => getDayKeyInTimeZone(date, timeZone)

const withMinutes = (baseDate: Date, minutes: number, timeZone: string) => {
  const key = dayKey(baseDate, timeZone)
  const [yearPart = '', monthPart = '', dayPart = ''] = key.split('-')
  const parsedYear = Number(yearPart)
  const parsedMonth = Number(monthPart)
  const parsedDay = Number(dayPart)

  const year = Number.isFinite(parsedYear) ? parsedYear : baseDate.getUTCFullYear()
  const month = Number.isFinite(parsedMonth) ? parsedMonth : baseDate.getUTCMonth() + 1
  const day = Number.isFinite(parsedDay) ? parsedDay : baseDate.getUTCDate()

  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60
  return zonedDateTimeToUtc(timeZone, year, month, day, hour, minute, 0).toISOString()
}

const sortByStart = (a: Shift, b: Shift, timeZone: string) =>
  getMinutesInTimeZoneDay(new Date(a.start), timeZone) - getMinutesInTimeZoneDay(new Date(b.start), timeZone)

const formatWeekday = (date: Date, timeZone: string, short = false) =>
  formatDateInTimeZone(date, timeZone, { weekday: short ? 'short' : 'long' })

const formatMonthDay = (date: Date, timeZone: string) => formatDateInTimeZone(date, timeZone, { month: 'short', day: 'numeric' })

const formatHour = (hour: number) => {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const normalized = hour % 12 || 12
  return `${normalized}${suffix}`
}

const formatHourMinute = (isoDate: string, timeZone: string) =>
  formatTimeInTimeZone(new Date(isoDate), timeZone, { hour: 'numeric', minute: '2-digit' })

const isSameMonth = (left: Date, right: Date, timeZone: string) =>
  formatDateInTimeZone(left, timeZone, { year: 'numeric', month: '2-digit' }) ===
  formatDateInTimeZone(right, timeZone, { year: 'numeric', month: '2-digit' })

const isToday = (date: Date, timeZone: string) => {
  const today = new Date()
  return dayKey(today, timeZone) === dayKey(date, timeZone)
}
