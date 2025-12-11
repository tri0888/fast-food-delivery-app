import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import jwt from 'jsonwebtoken'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { buildClient } from '../fixtures/app.js'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import User from '../../models/userModel.js'
import Food from '../../models/foodModel.js'

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

describe('API · /api/food endpoints', () => {
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

  const createAccount = async (role = 'admin') => {
    return User.create({
      name: `${role}-user`,
      email: `${role}+${Date.now()}@example.com`,
      password: 'Password123!',
      role
    })
  }

  it('allows admins to create menu items with an image upload', async () => {
    const admin = await createAccount('admin')
    const token = buildToken(admin)

    const response = await buildClient()
      .post('/api/food/add')
      .set('token', token)
      .field('name', 'API Product')
      .field('description', 'Product created from API suite')
      .field('price', '18')
      .field('category', 'Burger')
      .field('stock', '4')
      .attach('image', Buffer.from('spec-image'), 'api-product.png')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.name).toBe('API Product')

    createdImages.add(response.body.data.image)

    const stored = await Food.findOne({ name: 'API Product' }).lean()
    expect(stored).toBeTruthy()
    expect(stored.stock).toBe(4)
  })

  it('rejects non-admin attempts to create menu items', async () => {
    const user = await createAccount('user')
    const token = buildToken(user)

    const response = await buildClient()
      .post('/api/food/add')
      .set('token', token)
      .field('name', 'Unauthorized Product')
      .field('description', 'Should fail')
      .field('price', '12')
      .field('category', 'Salad')
      .field('stock', '3')
      .attach('image', Buffer.from('spec-image'), 'api-product.png')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toMatch(/permission/i)
  })

  it('allows admins to edit and remove menu items', async () => {
    const admin = await createAccount('admin')
    const token = buildToken(admin)
    const food = await Food.create({
      name: 'Editable',
      description: 'To be edited',
      price: 10,
      image: 'existing.png',
      category: 'Sides',
      stock: 2
    })

    const editResponse = await buildClient()
      .patch('/api/food/edit')
      .set('token', token)
      .field('id', food._id.toString())
      .field('name', 'Edited Name')
      .field('description', 'Edited description')
      .field('price', '15')
      .field('category', 'Sides')
      .field('stock', '5')

    expect(editResponse.status).toBe(200)
    expect(editResponse.body.success).toBe(true)

    const updated = await Food.findById(food._id).lean()
    expect(updated.name).toBe('Edited Name')
    expect(updated.price).toBe(15)

    const removeResponse = await buildClient()
      .post('/api/food/remove')
      .set('token', token)
      .send({ id: food._id.toString() })

    expect(removeResponse.status).toBe(200)
    expect(removeResponse.body.success).toBe(true)

    const deleted = await Food.findById(food._id)
    expect(deleted).toBeNull()
  })

  it('validates payloads when adding new menu items', async () => {
    const admin = await createAccount('admin')
    const token = buildToken(admin)

    const response = await buildClient()
      .post('/api/food/add')
      .set('token', token)
      .field('name', '')
      .field('description', 'Missing name should fail')
      .field('price', '0')
      .field('category', 'Burger')
      .field('stock', '-1')
      .attach('image', Buffer.from('spec-image'), 'api-product.png')

    expect(response.status).toBe(400)
    expect(response.body.status).toBe('fail')
    expect(response.body.message).toMatch(/cannot be left blank|must be greater/i)
  })
})
