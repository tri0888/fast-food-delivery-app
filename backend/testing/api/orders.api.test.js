import { beforeAll, afterAll, afterEach, describe, it, expect, jest } from '@jest/globals'
import jwt from 'jsonwebtoken'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import { createUser, createFood } from '../fixtures/dataFactory.js'
import Order from '../../models/orderModel.js'
import { orderApiData } from './test-data/orders.js'

const mockStripeAdapter = {
  createCheckoutSession: jest.fn()
}

jest.unstable_mockModule('../../modules/Payment/stripeAdapter.js', () => ({
  __esModule: true,
  default: mockStripeAdapter
}))

const { buildClient } = await import('../fixtures/app.js')

const buildToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET)
const placeOrderViaApi = ({ token, payload }) =>
  buildClient()
    .post('/api/order/place')
    .set('token', token)
    .send(payload)

describe('API · /api/order endpoints (CSV-aligned)', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'api-order-secret'
    process.env.FRONTEND_URL = 'http://localhost:4173'
    await connectInMemoryMongo()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
    jest.clearAllMocks()
  })

  it('API_ORDE_01 · places an order from cart data and returns Pending status', async () => {
    mockStripeAdapter.createCheckoutSession.mockResolvedValue('https://stripe.test/session')
    const user = await createUser({ cartData: { phantom: 1 } })
    const entree = await createFood({ name: orderApiData.menuItems.combo.name, price: orderApiData.menuItems.combo.price, stock: 10 })

    const response = await placeOrderViaApi({
      token: buildToken(user),
      payload: {
        userId: user._id.toString(),
        items: [
          {
            _id: entree._id.toString(),
            name: entree.name,
            price: entree.price,
            quantity: 2
          }
        ],
        amount: entree.price * 2,
        address: orderApiData.address()
      }
    })

    expect(response.status).toBe(201)
    expect(response.body.success).toBe(true)
    expect(response.body.session_url).toContain('stripe.test')
    expect(mockStripeAdapter.createCheckoutSession).toHaveBeenCalledTimes(1)

    const storedOrder = await Order.findOne({ userId: user._id.toString() }).lean()
    expect(storedOrder).toBeTruthy()
    expect(storedOrder.status).toBe('Pending')
  })

  it('API_ORDE_02 · rejects checkout when cart/items payload is empty', async () => {
    const user = await createUser({ cartData: {} })

    const response = await placeOrderViaApi({
      token: buildToken(user),
      payload: {
        userId: user._id.toString(),
        items: [],
        amount: 0,
        address: orderApiData.address()
      }
    })

    expect(response.status).toBe(400)
    expect(response.body.status).toBe('fail')
    expect(response.body.message).toMatch(/at least one item/i)
    expect(mockStripeAdapter.createCheckoutSession).not.toHaveBeenCalled()
  })

  it('API_ORDE_03 · returns only orders owned by the authenticated user', async () => {
    const owner = await createUser({ email: orderApiData.buildUserEmail('owner') })
    const other = await createUser({ email: orderApiData.buildUserEmail('other') })

    await Order.create([
      {
        userId: owner._id.toString(),
        items: [{ name: orderApiData.menuItems.ownerMeal.name, price: orderApiData.menuItems.ownerMeal.price, quantity: 1 }],
        amount: orderApiData.menuItems.ownerMeal.price,
        address: orderApiData.address()
      },
      {
        userId: other._id.toString(),
        items: [{ name: orderApiData.menuItems.otherMeal.name, price: orderApiData.menuItems.otherMeal.price, quantity: 1 }],
        amount: orderApiData.menuItems.otherMeal.price,
        address: orderApiData.address()
      }
    ])

    const response = await buildClient()
      .post('/api/order/userorders')
      .set('token', buildToken(owner))

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0].userId).toBe(owner._id.toString())
  })

  it('API_ORDE_04 · allows admins to list every order in the system', async () => {
    const admin = await createUser({ role: 'admin', email: orderApiData.buildUserEmail('admin-list') })
    await Order.create([
      { userId: 'user-1', items: [{ name: 'Matrix Burger', price: 10, quantity: 1 }], amount: 10, address: orderApiData.address() },
      { userId: 'user-2', items: [{ name: 'Matrix Fries', price: 5, quantity: 2 }], amount: 10, address: orderApiData.address() }
    ])

    const response = await buildClient()
      .get('/api/order/list')
      .set('token', buildToken(admin))

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(Array.isArray(response.body.data)).toBe(true)
    expect(response.body.data.length).toBeGreaterThanOrEqual(2)
  })

  it('API_ORDE_05 · transitions Pending -> Confirmed when admin updates status', async () => {
    const admin = await createUser({ role: 'admin', email: orderApiData.buildUserEmail('admin-status') })
    const order = await Order.create({
      userId: 'user-status-confirm',
      items: [{ name: orderApiData.menuItems.pending.name, price: orderApiData.menuItems.pending.price, quantity: 1 }],
      amount: orderApiData.menuItems.pending.price,
      address: orderApiData.address(),
      status: 'Pending'
    })

    const response = await buildClient()
      .patch('/api/order/status')
      .set('token', buildToken(admin))
      .send({ orderId: order._id.toString(), status: 'Confirmed' })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe('Status Updated')

    const updated = await Order.findById(order._id).lean()
    expect(updated.status).toBe('Confirmed')
  })

  it('API_ORDE_06 · rejects skipping Confirmed when jumping straight to Delivered', async () => {
    const admin = await createUser({ role: 'admin', email: orderApiData.buildUserEmail('admin-skip') })
    const order = await Order.create({
      userId: 'user-skip',
      items: [{ name: orderApiData.menuItems.skip.name, price: orderApiData.menuItems.skip.price, quantity: 1 }],
      amount: orderApiData.menuItems.skip.price,
      address: orderApiData.address(),
      status: 'Pending'
    })

    const response = await buildClient()
      .patch('/api/order/status')
      .set('token', buildToken(admin))
      .send({ orderId: order._id.toString(), status: 'Delivered' })

    expect(response.status).toBe(400)
    expect(response.body.status).toBe('fail')
    expect(response.body.message).toMatch(/must confirm before delivering/i)
  })

  it('API_ORDE_07 · blocks cancellation when order already delivering', async () => {
    const admin = await createUser({ role: 'admin', email: orderApiData.buildUserEmail('admin-cancel') })
    const order = await Order.create({
      userId: 'user-cancel',
      items: [{ name: orderApiData.menuItems.delivery.name, price: orderApiData.menuItems.delivery.price, quantity: 1 }],
      amount: orderApiData.menuItems.delivery.price,
      address: orderApiData.address(),
      status: 'Out for delivery'
    })

    const response = await buildClient()
      .patch('/api/order/status')
      .set('token', buildToken(admin))
      .send({ orderId: order._id.toString(), status: 'Cancelled' })

    expect(response.status).toBe(400)
    expect(response.body.status).toBe('fail')
    expect(response.body.message).toMatch(/cannot cancel .* delivering/i)

    const unchanged = await Order.findById(order._id).lean()
    expect(unchanged.status).toBe('Out for delivery')
  })

  it('API_ORDE_08 · verifies an order after payment gateway callback', async () => {
    const order = await Order.create({
      userId: 'user-verify',
      items: [{ name: orderApiData.menuItems.verify.name, price: orderApiData.menuItems.verify.price, quantity: 1 }],
      amount: orderApiData.menuItems.verify.price,
      address: orderApiData.address(),
      payment: false
    })

    const response = await buildClient()
      .post('/api/order/verify')
      .send({ orderId: order._id.toString(), success: 'true' })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe('Paid')

    const verified = await Order.findById(order._id).lean()
    expect(verified.payment).toBe(true)
  })
})
