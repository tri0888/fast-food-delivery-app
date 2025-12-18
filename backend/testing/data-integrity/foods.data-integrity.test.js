import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import Food from '../../models/foodModel.js'
import { dataIntegrityFoodData } from './test-data/foods.js'

describe('Data Integrity · Foods schema (CSV aligned)', () => {
  beforeAll(async () => {
    await connectInMemoryMongo()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
  })

  it('DAT_FOOD_DI_01 · rejects inserting Food documents without a price field', async () => {
    const payload = { ...dataIntegrityFoodData.baseFood() }
    delete payload.price

    await expect(Food.create(payload)).rejects.toThrow(/price/i)
  })

  it('DAT_FOOD_DI_02 · rejects inserting Food records with `price = null`', async () => {
    await expect(Food.create({ ...dataIntegrityFoodData.baseFood(), price: null })).rejects.toThrow(/price/i)
  })

  it('DAT_FOOD_DI_03 · enforces max length 255 for food names at insert time', async () => {
    const payload = { ...dataIntegrityFoodData.baseFood(), name: dataIntegrityFoodData.buildLongName(300) }

    await expect(Food.create(payload)).rejects.toThrow(/name.*length/i)
  })

  it('DAT_FOOD_DI_04 · blocks updates that push name length beyond 255 characters', async () => {
    const stored = await Food.create(dataIntegrityFoodData.baseFood())

    await expect(
      Food.findByIdAndUpdate(
        stored._id,
        { name: dataIntegrityFoodData.buildLongName(400) },
        { runValidators: true, new: true }
      )
    ).rejects.toThrow(/name.*length/i)
  })
})
