import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import User from '../../models/userModel.js'

const buildUser = (overrides = {}) => ({
  name: 'Integrity User',
  email: `integrity+${Date.now()}@example.com`,
  password: 'Password123!',
  ...overrides
})

describe('Data Integrity · Users schema', () => {
  beforeAll(async () => {
    await connectInMemoryMongo()
    await User.init()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
  })

  it('applies defaults for role, cartData, and lock state', async () => {
    const stored = await User.create(buildUser())

    expect(stored.role).toBe('user')
    expect(stored.cartData).toEqual({})
    expect(stored.isCartLock).toBe(false)
  })

  it('retains empty cart objects when retrieved back from Mongo', async () => {
    const stored = await User.create(buildUser())
    const fetched = await User.findById(stored._id).lean()

    expect(fetched.cartData).toEqual({})
    expect(Object.prototype.hasOwnProperty.call(fetched, 'cartData')).toBe(true)
  })

  it('enforces unique email addresses', async () => {
    const email = 'unique@example.com'
    await User.create(buildUser({ email }))

    await expect(User.create(buildUser({ email }))).rejects.toThrow(/duplicate/i)
  })

  it.each([
    ['name'],
    ['email'],
    ['password']
  ])('requires %s when persisting users', async (field) => {
    const payload = buildUser()
    delete payload[field]
    await expect(User.create(payload)).rejects.toThrow(/must have/i)
  })
})
