import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import Food from '../../models/foodModel.js'

const buildFood = (overrides = {}) => ({
  name: 'Data Burger',
  description: 'Integrity slice with automation sauce',
  price: 15,
  image: 'data-burger.jpg',
  category: 'Burger',
  ...overrides
})

describe('Data Integrity · Foods schema', () => {
  beforeAll(async () => {
    await connectInMemoryMongo()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
  })

  it('applies defaults for isAvailable, stock, and timestamps', async () => {
    const stored = await Food.create(buildFood())
    expect(stored.isAvailable).toBe(true)
    expect(stored.stock).toBe(0)
    expect(stored.createdAt).toBeInstanceOf(Date)
    expect(stored.updatedAt).toBeInstanceOf(Date)
  })

  it('honors explicit stock and availability overrides', async () => {
    const stored = await Food.create(buildFood({ stock: 7, isAvailable: false }))
    expect(stored.stock).toBe(7)
    expect(stored.isAvailable).toBe(false)
  })

  it.each([
    ['name'],
    ['description'],
    ['price'],
    ['image'],
    ['category']
  ])('requires %s to be provided', async (field) => {
    const payload = buildFood()
    delete payload[field]

    await expect(Food.create(payload)).rejects.toThrow(/must have/i)
  })

  it('rejects documents missing any required string content', async () => {
    await expect(Food.create(buildFood({ name: '' }))).rejects.toThrow(/name/i)
    await expect(Food.create(buildFood({ description: '' }))).rejects.toThrow(/description/i)
  })
})
