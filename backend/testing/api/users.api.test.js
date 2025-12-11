import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import bcrypt from 'bcrypt'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import { buildClient } from '../fixtures/app.js'
import User from '../../models/userModel.js'

beforeAll(async () => {
  process.env.JWT_SECRET = 'api-secret'
  await connectInMemoryMongo()
})

afterAll(async () => {
  await disconnectInMemoryMongo()
})

afterEach(async () => {
  await resetDatabase()
})

describe('API · /api/user endpoints', () => {
  it('registers a user and returns a token', async () => {
    const response = await buildClient()
      .post('/api/user/register')
      .send({ name: 'API User', email: `api+${Date.now()}@example.com`, password: 'ApiPass123!' })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.token).toBeTruthy()
  })

  it('logs in an existing user and returns their role', async () => {
    const email = `api-login+${Date.now()}@example.com`
    const hashed = await bcrypt.hash('ApiPass123!', 10)
    await User.create({ name: 'API Login', email, password: hashed, role: 'admin' })

    const response = await buildClient()
      .post('/api/user/login')
      .send({ email, password: 'ApiPass123!' })

    expect(response.status).toBe(200)
    expect(response.body.role).toBe('admin')
  })
})
