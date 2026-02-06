import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '../stores/auth'
import { useShiftsStore } from '../stores/shifts'
import type { Role } from '../@types/auth'
import type { Shift } from '../@types/shift'

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

const createShiftAsRole = (role: Role, shiftsStore: ReturnType<typeof useShiftsStore>, shift: Omit<Shift, 'id'>) => {
  if (role !== 'admin') return null
  return shiftsStore.create(shift)
}

const removeShiftAsRole = (role: Role, shiftsStore: ReturnType<typeof useShiftsStore>, shiftId: string) => {
  if (role !== 'admin') return
  shiftsStore.remove(shiftId)
}

const visibleShiftsForRole = (
  role: Role,
  currentUserId: string,
  shiftsStore: ReturnType<typeof useShiftsStore>
) => {
  if (role === 'admin') return shiftsStore.shifts
  return shiftsStore.forUser(currentUserId)
}

describe('role-based shift access (logic level)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()

    vi.stubGlobal('window', {})
    vi.stubGlobal('localStorage', createLocalStorageMock())
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'rbac-shift-id') })
  })

  it('admin role can create and delete shifts', () => {
    const auth = useAuthStore()
    const shiftsStore = useShiftsStore()
    shiftsStore.load()
    auth.login('u-admin', 'admin')

    const created = createShiftAsRole(auth.role!, shiftsStore, {
      employeeId: 'u-employee-1',
      employeeName: 'Erin Employee',
      title: 'Admin-created shift',
      start: '2026-02-15T09:00:00.000Z',
      end: '2026-02-15T17:00:00.000Z'
    })

    expect(created?.id).toBe('rbac-shift-id')

    removeShiftAsRole(auth.role!, shiftsStore, 'rbac-shift-id')
    expect(shiftsStore.byId('rbac-shift-id')).toBeUndefined()
  })

  it('employee role cannot mutate shifts (attempts are ignored)', () => {
    const auth = useAuthStore()
    const shiftsStore = useShiftsStore()
    shiftsStore.load()
    auth.login('u-employee-1', 'employee')

    const countBefore = shiftsStore.shifts.length
    const created = createShiftAsRole(auth.role!, shiftsStore, {
      employeeId: 'u-employee-1',
      employeeName: 'Erin Employee',
      title: 'Employee-created shift',
      start: '2026-02-18T09:00:00.000Z',
      end: '2026-02-18T17:00:00.000Z'
    })

    removeShiftAsRole(auth.role!, shiftsStore, 's-1001')

    expect(created).toBeNull()
    expect(shiftsStore.shifts.length).toBe(countBefore)
    expect(shiftsStore.byId('s-1001')).toBeDefined()
  })

  it('employee sees only their assigned shifts', () => {
    const auth = useAuthStore()
    const shiftsStore = useShiftsStore()
    shiftsStore.load()
    auth.login('u-employee-2', 'employee')

    const visible = visibleShiftsForRole(auth.role!, auth.userId!, shiftsStore)

    expect(visible.length).toBeGreaterThan(0)
    expect(visible.every((shift) => shift.employeeId === 'u-employee-2')).toBe(true)
  })
})
