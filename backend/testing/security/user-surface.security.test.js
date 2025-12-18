import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import app from '../../app.js'
import User from '../../models/userModel.js'
import { userSecurityData } from './test-data/users.js'

const buildToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET)

const seedUser = async ({
  role = 'user',
  email = userSecurityData.uniqueEmail(role),
  password = userSecurityData.seedPassword
} = {}) => {
  const hashed = await bcrypt.hash(password, 10)
  const user = await User.create({
    name: `${role}-security`,
    email,
    password: hashed,
    role
  })
  return { user, password }
}

describe('Security · Users surface (CSV aligned)', () => {
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

  it.each([
    'SEC_USER_SEC_01',
    'SEC_USER_SEC_06'
  ])('%s · login endpoint sanitizes SQL injection payloads', async (id) => {
    await seedUser({ email: userSecurityData.legitAccount.email })

    const response = await request(app)
      .post('/api/user/login')
      .send(userSecurityData.sqlInjectionLoginPayload)

    expect(response.status).toBe(400)
    expect(response.body.message).toMatch(/valid email/i)
  })

  it.each([
    'SEC_USER_SEC_02',
    'SEC_USER_SEC_07'
  ])('%s · brute-force attempts beyond 10 should lock the account', async (id) => {
    const { user } = await seedUser({ email: userSecurityData.uniqueEmail('brute') })

    let response
    for (let attempt = 0; attempt < userSecurityData.bruteForce.maxAttempts; attempt++) {
      response = await request(app)
        .post('/api/user/login')
        .send({ email: user.email, password: userSecurityData.bruteForce.wrongPassword })
    }

    expect(response.status).toBe(429)
    expect(response.body.message).toMatch(/too many/i)
  })

  it.each([
    'SEC_USER_SEC_03',
    'SEC_USER_SEC_08'
  ])('%s · admin API must reject missing bearer token', async (id) => {
    const response = await request(app).get('/api/user/list')
    expect(response.status).toBe(401)
    expect(response.body.message).toMatch(/unauthorized/i)
  })

  it.each([
    'SEC_USER_SEC_04',
    'SEC_USER_SEC_09'
  ])('%s · tokens signed with alg "none" must be rejected', async (id) => {
    const { user } = await seedUser({ role: 'admin', email: userSecurityData.uniqueEmail('admin') })
    const header = Buffer.from(JSON.stringify(userSecurityData.forgedTokenPieces.header)).toString('base64url')
    const payload = Buffer.from(JSON.stringify(userSecurityData.forgedTokenPieces.buildPayload(user._id))).toString('base64url')
    const forged = `${header}.${payload}.`

    const response = await request(app)
      .get('/api/user/list')
      .set('token', forged)

    expect(response.status).toBe(401)
    expect(response.body.message).toMatch(/unauthorized|jwt/i)
  })

  it.each([
    'SEC_USER_SEC_05',
    'SEC_USER_SEC_10'
  ])('%s · privilege escalation check: user token vs admin route', async (id) => {
    const { user } = await seedUser({ email: userSecurityData.uniqueEmail('user') })

    const response = await request(app)
      .get('/api/user/list')
      .set('token', buildToken(user))

    expect(response.status).toBe(403)
    expect(response.body.message).toMatch(/permission/i)
  })
})
