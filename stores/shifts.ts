import { defineStore } from 'pinia'
import type { Shift } from '../@types/shift'
import shiftsData from '../data/shifts.json'

const STORAGE_KEY = 'ms_shifts'
const seedShifts = shiftsData as Shift[]
const sortByStart = (shifts: Shift[]) => [...shifts].sort((left, right) => left.start.localeCompare(right.start))

export const useShiftsStore = defineStore('shifts', {
  state: () => ({
    shifts: [] as Shift[],
    loaded: false
  }),

  getters: {
    byId: (state) => (id: string) => state.shifts.find((shift) => shift.id === id),
    byEmployeeId: (state) => (employeeId: string) =>
      sortByStart(state.shifts.filter((shift) => shift.employeeId === employeeId)),
    forUser() {
      return (userId: string) => this.byEmployeeId(userId)
    }
  },

  actions: {
    ensureLoaded() {
      if (this.loaded) return
      this.load()
    },

    load() {
      if (this.loaded) return
      this.loaded = true

      if (typeof window === 'undefined') return

      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        this.shifts = sortByStart([...seedShifts])
        this.persist()
        return
      }

      try {
        const parsed = JSON.parse(raw) as Shift[]
        if (!Array.isArray(parsed)) {
          throw new Error('Invalid shifts payload')
        }
        this.shifts = sortByStart(parsed)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
        this.shifts = sortByStart([...seedShifts])
        this.persist()
      }
    },

    persist() {
      if (typeof window === 'undefined') return
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.shifts))
    },

    create(shift: Omit<Shift, 'id'>) {
      this.ensureLoaded()
      const newShift: Shift = {
        ...shift,
        id: crypto.randomUUID()
      }

      this.shifts = sortByStart([...this.shifts, newShift])
      this.persist()
      return newShift
    },

    update(id: string, patch: Partial<Shift>) {
      this.ensureLoaded()
      this.shifts = sortByStart(
        this.shifts.map((shift) =>
          shift.id === id
            ? {
                ...shift,
                ...patch
              }
            : shift
        )
      )
      this.persist()
    },

    remove(id: string) {
      this.ensureLoaded()
      this.shifts = this.shifts.filter((shift) => shift.id !== id)
      this.persist()
    },

    resetToSeed() {
      this.ensureLoaded()
      this.shifts = sortByStart([...seedShifts])
      this.persist()
    }
  }
})
