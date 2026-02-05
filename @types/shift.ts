export type CalendarMode = 'day' | 'week' | 'month'

export interface Shift {
  id: string
  employeeId: string
  employeeName: string
  title: string
  start: string
  end: string
  location?: string
  notes?: string
  color?: string
}
