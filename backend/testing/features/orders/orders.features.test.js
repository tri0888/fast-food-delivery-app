import { beforeAll, afterAll, afterEach, describe, it, expect, jest } from '@jest/globals'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../../fixtures/mongo.js'
import { createUser, createFood } from '../../fixtures/dataFactory.js'
import Food from '../../../models/foodModel.js'
import User from '../../../models/userModel.js'
import Order from '../../../models/orderModel.js'
import AppError from '../../../utils/appError.js'
import { orderFeatureData } from '../test-data/orders.js'
import { featureNullObjectId } from '../test-data/common.js'

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

  it('FE-ORD-001 · places orders end-to-end and returns a Stripe checkout url', async () => {
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
      orderFeatureData.address,
      orderFeatureData.frontendUrl
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

  it('FE-ORD-002 · blocks checkout when requested items exceed stock', async () => {
    const user = await createUser()
    const food = await createFood({ stock: 0 })

    await expect(
      placeOrderService.placeOrder(
        user._id,
        [{ _id: food._id, name: food.name, price: food.price, quantity: 1 }],
        food.price,
        orderFeatureData.lowStockAddress,
        orderFeatureData.frontendUrl
      )
    ).rejects.toBeInstanceOf(AppError)

    expect(mockStripeAdapter.createCheckoutSession).not.toHaveBeenCalled()
  })

  it('FE-ORD-003 · marks orders as paid when verification succeeds', async () => {
    const order = await Order.create({
      userId: 'user-pay',
      items: [{ _id: 'food', quantity: 1 }],
      amount: 10,
      address: orderFeatureData.paymentAddress
    })

    const response = await verifyOrderService.verifyOrder(order._id.toString(), 'true')
    expect(response).toEqual({ success: true, message: 'Paid' })

    const stored = await Order.findById(order._id).lean()
    expect(stored.payment).toBe(true)
  })

  it('FE-ORD-004 · enforces valid admin status transitions', async () => {
    const order = await Order.create({
      userId: 'user-status',
      items: [{ _id: 'food', quantity: 1 }],
      amount: 10,
      address: orderFeatureData.statusAddress,
      status: 'Food Processing'
    })

    await expect(updateStatusService.updateOrderStatus(order._id.toString(), 'Delivered')).resolves.not.toThrow()

    const updated = await Order.findById(order._id).lean()
    expect(updated.status).toBe('Delivered')

    await expect(updateStatusService.updateOrderStatus(order._id.toString(), 'INVALID')).rejects.toBeInstanceOf(AppError)
  })

  it('FE-ORD-005 · lists every order for admin monitoring', async () => {
    await Order.create([
      { userId: 'admin-list-one', items: [{ _id: 'food', quantity: 1 }], amount: 10, address: orderFeatureData.listAddresses[0] },
      { userId: 'admin-list-two', items: [{ _id: 'food2', quantity: 2 }], amount: 20, address: orderFeatureData.listAddresses[1] }
    ])

    const orders = await listOrdersService.getAllOrders()
    expect(orders).toHaveLength(2)
    expect(orders.map((order) => order.amount)).toEqual(expect.arrayContaining([10, 20]))
  })

  it('FE-ORD-006 · returns orders belonging to a specific user and rejects missing users', async () => {
    const customer = await createUser()
    const other = await createUser()

    await Order.create([
      { userId: customer._id, items: [{ _id: 'food', quantity: 1 }], amount: 15, address: orderFeatureData.userAddress },
      { userId: other._id, items: [{ _id: 'food', quantity: 1 }], amount: 25, address: orderFeatureData.otherAddress }
    ])

    const orders = await userOrdersService.getUserOrders(customer._id.toString())
    expect(orders).toHaveLength(1)
    expect(orders[0].userId.toString()).toBe(customer._id.toString())

    await expect(userOrdersService.getUserOrders(featureNullObjectId)).rejects.toBeInstanceOf(AppError)
  })
})
