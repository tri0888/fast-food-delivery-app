import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import jwt from 'jsonwebtoken'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { buildClient } from '../fixtures/app.js'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import User from '../../models/userModel.js'
import Food from '../../models/foodModel.js'
import { productApiData } from './test-data/products.js'
import { nullObjectId } from './test-data/common.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsDir = path.resolve(__dirname, '../../uploads')

const createdImages = new Set()

const buildToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET)

async function cleanupUploads() {
  for (const image of createdImages) {
    const target = path.join(uploadsDir, image)
    if (fs.existsSync(target)) {
      await fs.promises.unlink(target)
    }
  }
  createdImages.clear()
}
const sendAddFoodRequest = async ({ token, overrides = {}, fileName = productApiData.defaultImageName }) => {
  const payload = productApiData.baseFoodPayload(overrides)
  const request = buildClient().post('/api/food/add').set('token', token)
  Object.entries(payload).forEach(([key, value]) => {
    request.field(key, String(value))
  })
  return request.attach('image', productApiData.sampleImageBuffer, fileName)
}

describe('API · /api/food endpoints (CSV-aligned)', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'api-food-secret'
    await connectInMemoryMongo()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await cleanupUploads()
    await resetDatabase()
  })

  const createAccount = async (role = 'admin') =>
    User.create({
      name: `${role}-user`,
      email: `${role}+${Date.now()}@example.com`,
      password: 'Password123!',
      role
    })

  it('API_FOOD_01 · allows admin to add a food successfully', async () => {
    const admin = await createAccount('admin')
    const response = await sendAddFoodRequest({ token: buildToken(admin), fileName: productApiData.defaultImageName })

    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.data.name).toBe('Matrix Pho')

    createdImages.add(response.body.data.image)

    const stored = await Food.findOne({ name: 'Matrix Pho' }).lean()
    expect(stored).toBeTruthy()
    expect(stored.price).toBe(12)
  })

  it('API_FOOD_02 · rejects negative price payloads', async () => {
    const admin = await createAccount('admin')
    const response = await sendAddFoodRequest({ token: buildToken(admin), overrides: { price: -5000 } })

    expect(response.status).toBe(400)
    expect(response.body.status).toBe('fail')
    expect(response.body.message).toMatch(/price must be greater than 0/i)
  })

  it('API_FOOD_03 · rejects zero-price payloads when logic forbids free items', async () => {
    const admin = await createAccount('admin')
    const response = await sendAddFoodRequest({ token: buildToken(admin), overrides: { price: 0 } })

    expect(response.status).toBe(400)
    expect(response.body.status).toBe('fail')
    expect(response.body.message).toMatch(/price must be greater than 0/i)
  })

  it('API_FOOD_04 · rejects excessively large prices (boundary test)', async () => {
    const admin = await createAccount('admin')
    const response = await sendAddFoodRequest({ token: buildToken(admin), overrides: { price: 9_999_999_999 } })

    expect(response.status).toBe(400)
    expect(response.body.status).toBe('fail')
  })

  it('API_FOOD_05 · updates an existing food record with new data', async () => {
    const admin = await createAccount('admin')
    const food = await Food.create({
      name: 'Original Name',
      description: 'Pre-edit',
      price: 15,
      image: 'existing.png',
      category: 'Burger',
      stock: 3
    })

    const response = await buildClient()
      .patch('/api/food/edit')
      .set('token', buildToken(admin))
      .field('id', food._id.toString())
      .field('name', 'Edited Matrix Item')
      .field('description', 'Updated per API_FOOD_05')
      .field('price', '18')
      .field('category', 'Burger')
      .field('stock', '9')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)

    const updated = await Food.findById(food._id).lean()
    expect(updated.name).toBe('Edited Matrix Item')
    expect(updated.price).toBe(18)
  })

  it('API_FOOD_06 · removes an existing food entry', async () => {
    const admin = await createAccount('admin')
    const food = await Food.create({
      name: 'Delete Me',
      description: 'Removal target',
      price: 11,
      image: 'remove.png',
      category: 'Sides',
      stock: 1
    })

    const response = await buildClient()
      .post('/api/food/remove')
      .set('token', buildToken(admin))
      .send({ id: food._id.toString() })

    expect([200, 204]).toContain(response.status)
    expect(response.body.success).toBe(true)
    const deleted = await Food.findById(food._id)
    expect(deleted).toBeNull()
  })

  it('API_FOOD_07 · lists foods filtered by name keyword', async () => {
    await Food.create([
      { name: 'Pizza Matrix', description: 'CSV pizza', price: 20, image: 'pizza.png', category: 'Pizza', stock: 2 },
      { name: 'Burger Matrix', description: 'CSV burger', price: 14, image: 'burger.png', category: 'Burger', stock: 5 }
    ])

    const response = await buildClient().get('/api/food/list').query({ q: 'Pizza' })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].name).toContain('Pizza')
  })

  it('API_FOOD_08 · returns empty array when filter has no matches', async () => {
    await Food.create({ name: 'Pho Matrix', description: 'Pho only', price: 12, image: 'pho.png', category: 'Pho', stock: 2 })

    const response = await buildClient().get('/api/food/list').query({ q: 'NonExistingKeyword' })

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body.data)).toBe(true)
    expect(response.body.data.length).toBe(0)
  })

  it('API_FOOD_09 · rejects non-image uploads during add', async () => {
    const admin = await createAccount('admin')
    const payload = productApiData.baseFoodPayload()
    const request = buildClient().post('/api/food/add').set('token', buildToken(admin))
    Object.entries(payload).forEach(([key, value]) => request.field(key, String(value)))
    const response = await request.attach('image', productApiData.sampleImageBuffer, productApiData.invalidImageName)

    expect(response.status).toBe(400)
    expect(response.body.status).toBe('fail')
  })

  it('API_FOOD_10 · returns 404 when requesting non-existing food detail', async () => {
    const response = await buildClient().get(`/api/food/${nullObjectId}`)

    expect(response.status).toBe(404)
  })
})
