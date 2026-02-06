import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useShiftsStore } from '../stores/shifts'

const createLocalStorageMock = () => {
  const data: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => data[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      data[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete data[key]
    })
  }
}

describe('shifts store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()

    vi.stubGlobal('window', {})
    vi.stubGlobal('localStorage', createLocalStorageMock())
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'shift-generated-id') })
  })

  it('creates a shift', () => {
    const store = useShiftsStore()
    store.load()

    const created = store.create({
      employeeId: 'u-employee-1',
      employeeName: 'Erin Employee',
      title: 'Training shift',
      start: '2026-02-09T09:00:00.000Z',
      end: '2026-02-09T17:00:00.000Z',
      location: 'Training room',
      color: '#000000'
    })

    expect(created.id).toBe('shift-generated-id')
    expect(store.byId('shift-generated-id')).toEqual(created)
  })

  it('updates a shift time', () => {
    const store = useShiftsStore()
    store.load()

    store.update('s-1001', {
      start: '2026-02-02T10:00:00.000Z',
      end: '2026-02-02T18:00:00.000Z'
    })

    expect(store.byId('s-1001')).toMatchObject({
      start: '2026-02-02T10:00:00.000Z',
      end: '2026-02-02T18:00:00.000Z'
    })
  })

  it('deletes a shift', () => {
    const store = useShiftsStore()
    store.load()

    store.remove('s-1002')

    expect(store.byId('s-1002')).toBeUndefined()
  })

  it('forUser(userId) returns only that user’s shifts', () => {
    const store = useShiftsStore()
    store.load()

    const shifts = store.forUser('u-employee-2')

    expect(shifts.length).toBeGreaterThan(0)
    expect(shifts.every((shift) => shift.employeeId === 'u-employee-2')).toBe(true)
  })

  it('shifts are sorted by start date', () => {
    const store = useShiftsStore()
    store.load()

    store.create({
      employeeId: 'u-employee-1',
      employeeName: 'Erin Employee',
      title: 'Late shift',
      start: '2026-02-12T12:00:00.000Z',
      end: '2026-02-12T18:00:00.000Z'
    })

    store.create({
      employeeId: 'u-employee-1',
      employeeName: 'Erin Employee',
      title: 'Early shift',
      start: '2026-01-31T12:00:00.000Z',
      end: '2026-01-31T18:00:00.000Z'
    })

    const starts = store.shifts.map((shift) => shift.start)
    const sortedStarts = [...starts].sort((left, right) => left.localeCompare(right))

    expect(starts).toEqual(sortedStarts)
  })
})
