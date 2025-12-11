import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import app from '../../app.js'
import User from '../../models/userModel.js'

const buildToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET)

describe('Security · admin-only user surface', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'security-users-secret'
    await connectInMemoryMongo()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
  })

  it('rejects listing users when no token is supplied', async () => {
    const response = await request(app).get('/api/user/list')
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toMatch(/Not Authorized/i)
  })

  it('prevents non-admin roles from reading user inventories', async () => {
    const user = await User.create({
      name: 'Standard User',
      email: 'standard@example.com',
      password: 'Password123!',
      role: 'user'
    })
    const response = await request(app)
      .get('/api/user/list')
      .set('token', buildToken(user))

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toMatch(/permission/i)
  })

  it('allows admins to list users successfully', async () => {
    const admin = await User.create({
      name: 'Sec Admin',
      email: 'sec-admin@example.com',
      password: 'Password123!',
      role: 'admin'
    })

    const response = await request(app)
      .get('/api/user/list')
      .set('token', buildToken(admin))

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(Array.isArray(response.body.data)).toBe(true)
  })
})
