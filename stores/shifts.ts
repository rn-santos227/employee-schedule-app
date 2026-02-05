import { defineStore } from 'pinia'
import type { Shift } from '../@types/shift'
import shiftsData from '../data/shifts.json'

const STORAGE_KEY = 'ms_shifts'
const seedShifts = shiftsData as Shift[]

export const useShiftsStore = defineStore('shifts', {
  state: () => ({
    shifts: [] as Shift[],
    loaded: false
  }),

  getters: {
    byId: (state) => (id: string) => state.shifts.find((shift) => shift.id === id),
    byEmployeeId: (state) => (employeeId: string) =>
      state.shifts.filter((shift) => shift.employeeId === employeeId)
  },
})
