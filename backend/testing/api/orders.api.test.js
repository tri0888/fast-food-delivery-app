import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import jwt from 'jsonwebtoken'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import Food from '../../models/foodModel.js'
import User from '../../models/userModel.js'
import Order from '../../models/orderModel.js'
import { buildClient } from '../fixtures/app.js'

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

describe('API · /api/food/list', () => {
  it('returns food documents from database', async () => {
    await Food.create({ name: 'API burger', description: 'Test item', price: 10, category: 'Burger', image: 'api-burger.jpg' })

    const response = await buildClient().get('/api/food/list')

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].name).toBe('API burger')
  })
})

describe('API · /api/order workflow', () => {
  const buildToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET)

  it('returns orders for the authenticated user only', async () => {
    const user = await User.create({ name: 'Order API User', email: 'order-user@example.com', password: 'Password123!' })
    const otherUser = await User.create({ name: 'Other', email: 'other@example.com', password: 'Password123!' })

    await Order.create([
      {
        userId: user._id.toString(),
        items: [{ name: 'One', price: 5, quantity: 1 }],
        amount: 5,
        address: { street: 'User St', city: 'API' }
      },
      {
        userId: otherUser._id.toString(),
        items: [{ name: 'Other', price: 7, quantity: 1 }],
        amount: 7,
        address: { street: 'Other St', city: 'API' }
      }
    ])

    const response = await buildClient()
      .post('/api/order/userorders')
      .set('token', buildToken(user))

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].userId).toBe(user._id.toString())
  })

  it('allows admins to list every order', async () => {
    const admin = await User.create({ name: 'Admin', email: 'admin-order@example.com', password: 'Password123!', role: 'admin' })

    await Order.create({
      userId: admin._id.toString(),
      items: [{ name: 'Admin order', price: 9, quantity: 1 }],
      amount: 9,
      address: { street: 'Admin', city: 'API' }
    })

    const response = await buildClient()
      .get('/api/order/list')
      .set('token', buildToken(admin))

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(Array.isArray(response.body.data)).toBe(true)
    expect(response.body.data.length).toBeGreaterThanOrEqual(1)
  })

  it('updates order status when requested by an admin', async () => {
    const admin = await User.create({ name: 'Admin Status', email: 'admin-status@example.com', password: 'Password123!', role: 'admin' })
    const order = await Order.create({
      userId: 'user-status',
      items: [{ name: 'Status Meal', price: 11, quantity: 1 }],
      amount: 11,
      status: 'Food Processing',
      address: { street: 'Status', city: 'API' }
    })

    const response = await buildClient()
      .patch('/api/order/status')
      .set('token', buildToken(admin))
      .send({ orderId: order._id.toString(), status: 'Delivered' })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe('Status Updated')

    const updated = await Order.findById(order._id).lean()
    expect(updated.status).toBe('Delivered')
  })

  it('surfaces validation errors when admins provide invalid order identifiers', async () => {
    const admin = await User.create({ name: 'Admin Missing Order', email: 'admin-miss@example.com', password: 'Password123!', role: 'admin' })

    const response = await buildClient()
      .patch('/api/order/status')
      .set('token', buildToken(admin))
      .send({ orderId: '000000000000000000000000', status: 'Delivered' })

    expect(response.status).toBe(404)
    expect(response.body.status).toBe('fail')
    expect(response.body.message).toMatch(/order not found/i)
  })
})
