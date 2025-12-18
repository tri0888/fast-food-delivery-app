import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import path from 'path'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import app from '../../app.js'
import User from '../../models/userModel.js'
import Food from '../../models/foodModel.js'
import { foodSecurityData } from './test-data/foods.js'

const uploadsDir = path.resolve('uploads')
const buildToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET)
const createAdmin = async () => {
  return User.create(foodSecurityData.adminProfile())
}

const sendAddFoodRequest = (token, fields) => {
  const req = request(app).post('/api/food/add').set('token', token)
  Object.entries(fields).forEach(([key, value]) => req.field(key, String(value)))
  const { buffer, filename } = foodSecurityData.attachments.image()
  return req.attach('image', buffer, filename)
}

describe('Security · Food XSS hardening (CSV aligned)', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'security-food-secret'
    await connectInMemoryMongo()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
  })

  it('SEC_FOOD_SEC_01 · rejects script tags in food description payloads', async () => {
    const admin = await createAdmin()
    const response = await sendAddFoodRequest(buildToken(admin), {
      name: foodSecurityData.metadata.nameScript,
      description: foodSecurityData.payloads.scriptDescription,
      price: 10,
      category: 'Pho',
      stock: 5
    })

    expect(response.status).toBe(400)
    expect(response.body.message).toMatch(/script|invalid/i)
  })

  it('SEC_FOOD_SEC_02 · persists sanitized description when script payload is supplied', async () => {
    const admin = await createAdmin()
    const response = await sendAddFoodRequest(buildToken(admin), {
      name: foodSecurityData.metadata.nameSanitized,
      description: foodSecurityData.payloads.imageOnError,
      price: 12,
      category: 'Sandwich',
      stock: 3
    })

    expect(response.status).toBe(201)

    const stored = await Food.findOne({ name: foodSecurityData.metadata.nameSanitized }).lean()
    expect(stored.description).not.toContain('<script')
    expect(stored.description).not.toContain('onerror')
  })
})
