import { beforeAll, afterAll, afterEach, describe, it, expect, jest } from '@jest/globals'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../../fixtures/mongo.js'
import Food from '../../../models/foodModel.js'
import addFoodService from '../../../modules/Foods/addFood/Service.js'
import editFoodService from '../../../modules/Foods/editFood/Service.js'
import listFoodService from '../../../modules/Foods/listFood/Service.js'
import removeFoodService from '../../../modules/Foods/removeFood/Service.js'
import AppError from '../../../utils/appError.js'
import fs from 'fs'

describe('Features · Products capability', () => {
  beforeAll(async () => {
    await connectInMemoryMongo()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
    jest.restoreAllMocks()
  })

  const buildPayload = (overrides = {}) => ({
    name: 'Spec Salad',
    description: 'Feature-informed salad',
    price: 9,
    category: 'Salad',
    stock: 5,
    isAvailable: true,
    ...overrides
  })

  const fakeFile = (filename = 'spec-salad.jpg') => ({ filename })

  it('creates a product with server-side validation + defaults', async () => {
    const created = await addFoodService.createFood(buildPayload(), fakeFile())

    expect(created.name).toBe('Spec Salad')
    expect(created.isAvailable).toBe(true)
    expect(typeof created.image).toBe('string')
    expect(created.stock).toBe(5)
  })

  it('rejects invalid payloads (missing fields or negative values)', async () => {
    await expect(addFoodService.createFood(buildPayload({ name: '' }), fakeFile())).rejects.toBeInstanceOf(AppError)
    await expect(addFoodService.createFood(buildPayload({ price: -1 }), fakeFile())).rejects.toBeInstanceOf(AppError)
    await expect(addFoodService.createFood(buildPayload({ stock: -5 }), fakeFile())).rejects.toBeInstanceOf(AppError)
  })

  it('updates product details and swaps image when provided', async () => {
    const existing = await Food.create({
      ...buildPayload(),
      image: 'orig.jpg'
    })

    const updated = await editFoodService.updateFood(existing._id.toString(), {
      ...buildPayload({ name: 'Updated Spec', price: 11, stock: 3 })
    }, fakeFile('updated.jpg'))

    expect(updated.name).toBe('Updated Spec')
    expect(updated.price).toBe(11)
    expect(updated.stock).toBe(3)
    expect(updated.image).toBe('updated.jpg')
  })

  it('removes a product and unlinks the underlying file', async () => {
    const unlinkSpy = jest.spyOn(fs, 'unlink').mockImplementation((_, cb) => cb && cb(null))
    const existing = await Food.create({
      ...buildPayload({ name: 'Removable' }),
      image: 'removable.jpg'
    })

    await expect(removeFoodService.deleteFood(existing._id.toString())).resolves.not.toThrow()

    const deleted = await Food.findById(existing._id)
    expect(deleted).toBeNull()
    expect(unlinkSpy).toHaveBeenCalled()
  })

  it('lists every product for storefront surfaces', async () => {
    const created = await Food.create([
      { ...buildPayload({ name: 'List Salad A' }), image: 'a.jpg' },
      { ...buildPayload({ name: 'List Salad B', price: 11 }), image: 'b.jpg' }
    ])

    const foods = await listFoodService.getAllFoods()
    const names = foods.map((food) => food.name)

    expect(names).toEqual(expect.arrayContaining(['List Salad A', 'List Salad B']))
    expect(foods).toHaveLength(created.length)
  })
})
