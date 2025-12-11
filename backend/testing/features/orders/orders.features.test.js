import { beforeAll, afterAll, afterEach, describe, it, expect, jest } from '@jest/globals'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../../fixtures/mongo.js'
import { createUser, createFood } from '../../fixtures/dataFactory.js'
import Food from '../../../models/foodModel.js'
import User from '../../../models/userModel.js'
import Order from '../../../models/orderModel.js'
import AppError from '../../../utils/appError.js'

const mockStripeAdapter = {
  createCheckoutSession: jest.fn()
}

jest.unstable_mockModule('../../../modules/Payment/stripeAdapter.js', () => ({
  __esModule: true,
  default: mockStripeAdapter
}))

const { default: listOrdersService } = await import('../../../modules/Orders/listOrders/Service.js')
const { default: placeOrderService } = await import('../../../modules/Orders/placeOrder/Service.js')
const { default: updateStatusService } = await import('../../../modules/Orders/updateStatus/Service.js')
const { default: userOrdersService } = await import('../../../modules/Orders/userOrders/Service.js')
const { default: verifyOrderService } = await import('../../../modules/Orders/verifyOrder/Service.js')

const frontendUrl = 'http://localhost:4173'

describe('Features · Orders capability', () => {
  beforeAll(async () => {
    await connectInMemoryMongo()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
    jest.clearAllMocks()
  })

  it('places orders end-to-end and returns a Stripe checkout url', async () => {
    const user = await createUser({ cartData: { stale: 2 } })
    const food = await createFood({ stock: 5 })
    mockStripeAdapter.createCheckoutSession.mockResolvedValue('https://stripe.test/checkout-session')

    const items = [{
      _id: food._id,
      name: food.name,
      price: food.price,
      quantity: 2
    }]

    const amount = items.reduce((total, item) => total + item.price * item.quantity, 0)

    const response = await placeOrderService.placeOrder(
      user._id,
      items,
      amount,
      { street: '123 Feature', city: 'Orders', country: 'VN' },
      frontendUrl
    )

    expect(response.session_url).toBe('https://stripe.test/checkout-session')
    expect(mockStripeAdapter.createCheckoutSession).toHaveBeenCalledTimes(1)

    const storedOrder = await Order.findOne({ userId: user._id }).lean()
    expect(storedOrder.items[0].quantity).toBe(2)
    expect(storedOrder.amount).toBe(amount)

    const updatedFood = await Food.findById(food._id).lean()
    expect(updatedFood.stock).toBe(3)

    const refreshedUser = await User.findById(user._id).lean()
    expect(refreshedUser.cartData).toEqual({})
  })

  it('blocks checkout when requested items exceed stock', async () => {
    const user = await createUser()
    const food = await createFood({ stock: 0 })

    await expect(
      placeOrderService.placeOrder(
        user._id,
        [{ _id: food._id, name: food.name, price: food.price, quantity: 1 }],
        food.price,
        { street: 'Low Stock', city: 'Orders', country: 'VN' },
        frontendUrl
      )
    ).rejects.toBeInstanceOf(AppError)

    expect(mockStripeAdapter.createCheckoutSession).not.toHaveBeenCalled()
  })

  it('marks orders as paid when verification succeeds', async () => {
    const order = await Order.create({
      userId: 'user-pay',
      items: [{ _id: 'food', quantity: 1 }],
      amount: 10,
      address: { street: 'Pay', city: 'Orders' }
    })

    const response = await verifyOrderService.verifyOrder(order._id.toString(), 'true')
    expect(response).toEqual({ success: true, message: 'Paid' })

    const stored = await Order.findById(order._id).lean()
    expect(stored.payment).toBe(true)
  })

  it('enforces valid admin status transitions', async () => {
    const order = await Order.create({
      userId: 'user-status',
      items: [{ _id: 'food', quantity: 1 }],
      amount: 10,
      address: { street: 'Status', city: 'Orders' },
      status: 'Food Processing'
    })

    await expect(updateStatusService.updateOrderStatus(order._id.toString(), 'Delivered')).resolves.not.toThrow()

    const updated = await Order.findById(order._id).lean()
    expect(updated.status).toBe('Delivered')

    await expect(updateStatusService.updateOrderStatus(order._id.toString(), 'INVALID')).rejects.toBeInstanceOf(AppError)
  })

  it('lists every order for admin monitoring', async () => {
    await Order.create([
      { userId: 'admin-list-one', items: [{ _id: 'food', quantity: 1 }], amount: 10, address: { street: 'A' } },
      { userId: 'admin-list-two', items: [{ _id: 'food2', quantity: 2 }], amount: 20, address: { street: 'B' } }
    ])

    const orders = await listOrdersService.getAllOrders()
    expect(orders).toHaveLength(2)
    expect(orders.map((order) => order.amount)).toEqual(expect.arrayContaining([10, 20]))
  })

  it('returns orders belonging to a specific user and rejects missing users', async () => {
    const customer = await createUser()
    const other = await createUser()

    await Order.create([
      { userId: customer._id, items: [{ _id: 'food', quantity: 1 }], amount: 15, address: { street: 'User' } },
      { userId: other._id, items: [{ _id: 'food', quantity: 1 }], amount: 25, address: { street: 'Other' } }
    ])

    const orders = await userOrdersService.getUserOrders(customer._id.toString())
    expect(orders).toHaveLength(1)
    expect(orders[0].userId.toString()).toBe(customer._id.toString())

    await expect(userOrdersService.getUserOrders('000000000000000000000000')).rejects.toBeInstanceOf(AppError)
  })
})
