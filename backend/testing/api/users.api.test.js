import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import jwt from 'jsonwebtoken'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import { buildClient } from '../fixtures/app.js'
import { createUser } from '../fixtures/dataFactory.js'
import User from '../../models/userModel.js'
import { passwords } from './test-data/common.js'
import { userApiData } from './test-data/users.js'

const sendRegisterRequest = (overrides = {}, tag = 'register') =>
  buildClient()
    .post('/api/user/register')
    .send(userApiData.buildRegisterPayload(overrides, tag))

const loginViaApi = (email, password) =>
  buildClient()
    .post('/api/user/login')
    .send({ email, password })

const buildToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET)

const createAdminAccount = () => createUser({ role: 'admin', email: userApiData.uniqueEmail('admin') })

describe('API · /api/user endpoints (CSV-aligned)', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'api-user-secret'
    await connectInMemoryMongo()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
  })

  it('API_USER_01 · registers successfully with 201 Created per matrix', async () => {
    const response = await sendRegisterRequest()

    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.token).toBeTruthy()
  })

  it('API_USER_02 · rejects malformed email formats', async () => {
    const response = await sendRegisterRequest({ email: userApiData.invalidEmail })

    expect(response.status).toBe(400)
    expect(response.body.status).toBe('fail')
    expect(response.body.message).toMatch(/valid email/i)
  })

  it('API_USER_03 · rejects passwords shorter than six characters', async () => {
    const response = await buildClient()
      .post('/api/user/register')
      .send({ name: 'Short Pass', email: userApiData.uniqueEmail('short-pass'), password: passwords.weak })

    expect(response.status).toBe(400)
    expect(response.body.status).toBe('fail')
    expect(response.body.message).toMatch(/strong password/i)
  })

  it('API_USER_04 · surfaces conflict when email already exists', async () => {
    const duplicateEmail = userApiData.uniqueEmail('duplicate')
    await sendRegisterRequest({ email: duplicateEmail }, 'duplicate')

    const response = await sendRegisterRequest({ email: duplicateEmail }, 'duplicate-second')

    expect(response.status).toBe(409)
    expect(response.body.message).toMatch(/already exists/i)
  })

  it('API_USER_05 · logs in successfully and returns token', async () => {
    const email = userApiData.uniqueEmail('login-success')
    await sendRegisterRequest({ email }, 'login-success')

    const response = await loginViaApi(email, passwords.strong)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.token).toBeTruthy()
  })

  it('API_USER_06 · rejects login attempts with wrong password', async () => {
    const email = userApiData.uniqueEmail('login-wrong-pass')
    await sendRegisterRequest({ email }, 'login-wrong-pass')

    const response = await loginViaApi(email, passwords.wrong)

    expect(response.status).toBe(401)
    expect(response.body.status).toBe('fail')
    expect(response.body.message).toMatch(/incorrect password/i)
  })

  it('API_USER_07 · rejects login attempts with non-existent email', async () => {
    const response = await loginViaApi(userApiData.uniqueEmail('missing'), passwords.strong)

    expect([401, 404]).toContain(response.status)
    expect(response.body.message).toMatch(/incorrect email/i)
  })

  it('API_USER_08 · toggles cart lock state after successful login flow', async () => {
    const admin = await createAdminAccount()
    const customer = await createUser({ email: userApiData.uniqueEmail('cart-lock') })

    const response = await buildClient()
      .patch('/api/user/toggle-cart-lock')
      .set('token', buildToken(admin))
      .send({ userId: customer._id.toString() })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.isCartLock).toBe(true)

    const reloaded = await User.findById(customer._id).lean()
    expect(reloaded.isCartLock).toBe(true)
  })

  it('API_USER_09 · prevents locked users from logging in', async () => {
    const admin = await createAdminAccount()
    const email = userApiData.uniqueEmail('locked-user')
    await sendRegisterRequest({ email }, 'locked-user')
    const lockedUser = await User.findOne({ email }).lean()

    await buildClient()
      .patch('/api/user/toggle-cart-lock')
      .set('token', buildToken(admin))
      .send({ userId: lockedUser._id.toString() })

    const response = await loginViaApi(email, passwords.strong)

    expect(response.status).toBe(403)
    expect(response.body.status).toBe('fail')
    expect(response.body.message).toMatch(/locked/i)
  })

  it('API_USER_10 · lists users with pagination limit 10', async () => {
    const admin = await createAdminAccount()

    for (let i = 0; i < 12; i++) {
      await createUser({ email: userApiData.uniqueEmail(`list-${i}`) })
    }

    const response = await buildClient()
      .get('/api/user/list')
      .query({ page: 1, limit: 10 })
      .set('token', buildToken(admin))

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.length).toBeLessThanOrEqual(10)
  })
})
