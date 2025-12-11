import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import app from '../../app.js'
import User from '../../models/userModel.js'
import Order from '../../models/orderModel.js'

const buildAddress = () => ({
  firstName: 'Security',
  lastName: 'Suite',
  phone: '+84 900 000 000',
  city: 'Ho Chi Minh',
  state: 'District 1',
  zipcode: '700000',
  country: 'Vietnam'
})

describe('Security · privileged order surface', () => {
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

  const createAccount = async (role = 'user') => {
    const user = await User.create({
      name: `${role}-tester`,
      email: `${role}+${Date.now()}@example.com`,
      password: 'Test1234!',
      role,
      cartData: {}
    })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
    return { user, token }
  }

  it('rejects privileged order listing when no token is supplied', async () => {
    const response = await request(app).get('/api/order/list')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toMatch(/Not Authorized/i)
  })

  it('rejects forged tokens signed with the wrong secret', async () => {
    const { user } = await createAccount('admin')
    const forgedToken = jwt.sign({ id: user._id }, 'wrong-secret')

    const response = await request(app)
      .get('/api/order/list')
      .set('token', forgedToken)

    const message = response.body.message
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(false)
    expect(
      typeof message === 'string'
        ? message
        : message?.name || JSON.stringify(message)
    ).toMatch(/jwt|signature|JsonWebToken/i)
  })

  it('prevents regular users from mutating order status', async () => {
    const { user, token } = await createAccount('user')
    const order = await Order.create({
      userId: user._id.toString(),
      items: [
        { _id: 'food-locked', name: 'Locked Meal', quantity: 1 }
      ],
      amount: 25,
      address: buildAddress()
    })

    const response = await request(app)
      .patch('/api/order/status')
      .set('token', token)
      .send({ orderId: order._id.toString(), status: 'Delivered' })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toMatch(/permission/i)

    const freshOrder = await Order.findById(order._id).lean()
    expect(freshOrder.status).toBe('Food Processing')
  })
})
