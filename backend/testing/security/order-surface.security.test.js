import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import app from '../../app.js'
import User from '../../models/userModel.js'
import Order from '../../models/orderModel.js'
import { orderSecurityData } from './test-data/orders.js'

describe('Security · Orders IDOR coverage (CSV aligned)', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'security-suite-secret'
    await connectInMemoryMongo()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
  })

  const createAccount = async (role = orderSecurityData.attackerProfile.role, tag = role) => {
    const user = await User.create({
      name: `${role}-tester`,
      email: orderSecurityData.userEmail(tag),
      password: orderSecurityData.accountPassword,
      role,
      cartData: {}
    })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
    return { user, token }
  }

  it('SEC_ORDE_SEC_01 · user cannot override body userId to read another user orders', async () => {
    const { user: attacker, token } = await createAccount('user', 'attacker')
    const { user: victim } = await createAccount('user', 'victim')

    await Order.create({
      userId: victim._id.toString(),
      items: orderSecurityData.victimOrderItems.first(),
      amount: 9,
      address: orderSecurityData.address()
    })

    const response = await request(app)
      .post('/api/order/userorders')
      .set('token', token)
      .send({ userId: victim._id.toString() })

    expect(response.status).toBe(403)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toMatch(/forbidden/i)
  })

  it('SEC_ORDE_SEC_02 · crafting orderId in query string should not expose other user data', async () => {
    const { user: attacker, token } = await createAccount('user', 'attacker')
    const { user: victim } = await createAccount('user', 'victim')
    const victimOrder = await Order.create({
      userId: victim._id.toString(),
      items: orderSecurityData.victimOrderItems.second(),
      amount: 11,
      address: orderSecurityData.address()
    })

    const response = await request(app)
      .get(`/api/order/list?orderId=${victimOrder._id.toString()}`)
      .set('token', token)

    expect(response.status).toBe(403)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toMatch(/forbidden/i)
  })
})
