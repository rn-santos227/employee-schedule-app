import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import usersSeed from '../data/users.json'
import { useUsersStore } from '../stores/users'

type StorageMap = Record<string, string>

const createLocalStorageMock = (seed: StorageMap = {}) => {
  const data: StorageMap = { ...seed }

  return {
    getItem: vi.fn((key: string) => (key in data ? data[key] : null)),
    setItem: vi.fn((key: string, value: string) => {
      data[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete data[key]
    }),
    clear: vi.fn(() => {
      Object.keys(data).forEach((key) => delete data[key])
    }),
    dump: () => ({ ...data })
  }
}

describe('users store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.restoreAllMocks()

    vi.stubGlobal('window', {})
    vi.stubGlobal('localStorage', createLocalStorageMock())
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'user-generated-id') })
  })

  it('loads seeded users when localStorage is empty', () => {
    const store = useUsersStore()

    store.load()

    expect(store.users).toEqual(usersSeed)
    expect(localStorage.setItem).toHaveBeenCalledWith('ms_users', JSON.stringify(usersSeed))
  })

  it('creates a user and persists it', async () => {
    const store = useUsersStore()
    store.load()

    const created = await store.create({
      name: 'Taylor Employee',
      email: 'taylor.employee@example.com',
      role: 'employee',
      timezone: 'America/Denver'
    })

    expect(created.id).toBe('user-generated-id')
    expect(store.users.at(-1)).toEqual(created)
    expect(localStorage.setItem).toHaveBeenLastCalledWith('ms_users', JSON.stringify(store.users))
  })

  it('updates an existing user', async () => {
    const store = useUsersStore()
    store.load()

    await store.update('u-employee-1', {
      name: 'Erin Updated',
      timezone: 'America/Phoenix'
    })

    expect(store.byId('u-employee-1')).toMatchObject({
      name: 'Erin Updated',
      timezone: 'America/Phoenix'
    })
  })

  it('deletes a user', () => {
    const store = useUsersStore()
    store.load()

    store.remove('u-employee-2')

    expect(store.byId('u-employee-2')).toBeUndefined()
    expect(store.users).toHaveLength(usersSeed.length - 1)
  })

  it("employees getter returns only users with role === 'employee'", () => {
    const store = useUsersStore()
    store.load()

    expect(store.employees.every((user) => user.role === 'employee')).toBe(true)
    expect(store.employees).toHaveLength(2)
  })

  it('byId getter returns correct user', () => {
    const store = useUsersStore()
    store.load()

    const user = store.byId('u-admin')

    expect(user).toBeDefined()
    expect(user?.email).toBe('alex.admin@example.com')
  })
})
