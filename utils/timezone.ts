const weekdayIndexMap: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6
}

type ZonedParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
  weekday: number
}

const formatterCache = new Map<string, Intl.DateTimeFormat>()

const getFormatter = (timeZone: string) => {
  const normalizedTimeZone = normalizeTimeZone(timeZone)
  const key = `parts:${normalizedTimeZone}`
  const cached = formatterCache.get(key)
  if (cached) return cached

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: normalizedTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
    hour12: false
  })

  formatterCache.set(key, formatter)
  return formatter
}

const getZonedParts = (date: Date, timeZone: string): ZonedParts => {
  const formatter = getFormatter(timeZone)
  const parts = formatter.formatToParts(date)
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    hour: Number(lookup.hour),
    minute: Number(lookup.minute),
    second: Number(lookup.second),
    weekday: weekdayIndexMap[lookup.weekday] ?? 0
  }
}

export const normalizeTimeZone = (timeZone?: string) => {
  if (!timeZone) return 'UTC'

  try {
    Intl.DateTimeFormat(undefined, { timeZone })
    return timeZone
  } catch {
    return 'UTC'
  }
}

export const getTimeZoneOffsetMs = (date: Date, timeZone: string) => {
  const zoned = getZonedParts(date, timeZone)
  const asUtc = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second)
  return asUtc - date.getTime()
}

export const zonedDateTimeToUtc = (
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0
) => {
  const normalizedTimeZone = normalizeTimeZone(timeZone)
  let utcGuess = Date.UTC(year, month - 1, day, hour, minute, second)

  for (let i = 0; i < 3; i += 1) {
    const offset = getTimeZoneOffsetMs(new Date(utcGuess), normalizedTimeZone)
    const nextGuess = Date.UTC(year, month - 1, day, hour, minute, second) - offset
    if (nextGuess === utcGuess) break
    utcGuess = nextGuess
  }

  return new Date(utcGuess)
}

export const getDayKeyInTimeZone = (date: Date, timeZone: string) => {
  const zoned = getZonedParts(date, timeZone)
  return `${zoned.year}-${String(zoned.month).padStart(2, '0')}-${String(zoned.day).padStart(2, '0')}`
}

export const getMinutesInTimeZoneDay = (date: Date, timeZone: string) => {
  const zoned = getZonedParts(date, timeZone)
  return zoned.hour * 60 + zoned.minute
}

export const getStartOfWeekInTimeZone = (date: Date, timeZone: string) => {
  const zoned = getZonedParts(date, timeZone)
  return zonedDateTimeToUtc(timeZone, zoned.year, zoned.month, zoned.day - zoned.weekday, 0, 0, 0)
}

export const getStartOfMonthInTimeZone = (date: Date, timeZone: string) => {
  const zoned = getZonedParts(date, timeZone)
  return zonedDateTimeToUtc(timeZone, zoned.year, zoned.month, 1, 0, 0, 0)
}

export const addDaysInTimeZone = (date: Date, days: number, timeZone: string) => {
  const zoned = getZonedParts(date, timeZone)
  return zonedDateTimeToUtc(timeZone, zoned.year, zoned.month, zoned.day + days, zoned.hour, zoned.minute, zoned.second)
}

export const addMonthsInTimeZone = (date: Date, months: number, timeZone: string) => {
  const zoned = getZonedParts(date, timeZone)
  return zonedDateTimeToUtc(timeZone, zoned.year, zoned.month + months, 1, 12, 0, 0)
}

export const formatDateInTimeZone = (
  date: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions
) =>
  date.toLocaleDateString(undefined, {
    ...options,
    timeZone: normalizeTimeZone(timeZone)
  })

export const formatTimeInTimeZone = (
  date: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions
) =>
  date.toLocaleTimeString(undefined, {
    ...options,
    timeZone: normalizeTimeZone(timeZone)
  })

export const withMinutesInTimeZone = (baseDate: Date, minutes: number, timeZone: string) => {
  const zoned = getZonedParts(baseDate, timeZone)
  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60
  return zonedDateTimeToUtc(timeZone, zoned.year, zoned.month, zoned.day, hour, minute, 0)
}
