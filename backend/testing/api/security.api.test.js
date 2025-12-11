import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import bcrypt from 'bcrypt'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import User from '../../models/userModel.js'
import { buildClient } from '../fixtures/app.js'

describe('API · security hardening', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'api-security-secret'
    await connectInMemoryMongo()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
  })

  it('rejects login attempts that try to inject Mongo operators', async () => {
    const hashed = await bcrypt.hash('SafePass123!', 10)
    await User.create({ name: 'Security Bot', email: 'secure@example.com', password: hashed })

    const response = await buildClient()
      .post('/api/user/login')
      .send({ email: { $gt: '' }, password: { $gt: '' } })

    expect(response.status).toBe(400)
    expect(response.body.status).toBe('fail')
    expect(response.body.message).toMatch(/valid email|provide email/i)
  })

  it('blocks cart mutations when no JWT token is present', async () => {
    const response = await buildClient()
      .post('/api/cart/add')
      .send({ itemId: 'food-1' })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toMatch(/Not Authorized/i)
  })
})
