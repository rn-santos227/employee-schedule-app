export const ROUTES = {
  login: '/login',
  adminUsers: '/admin/users',
  adminSchedule: '/admin/schedule',
  adminScheduleByEmployeeId: (id: string) => `/admin/schedule/${id}`,
  employeeScheduleById: (id: string) => `/employee/schedule/${id}`
} as const
