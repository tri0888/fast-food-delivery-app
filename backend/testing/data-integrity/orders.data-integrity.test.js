import { beforeAll, afterAll, afterEach, describe, it, expect, jest } from '@jest/globals'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import { createUser, createFood } from '../fixtures/dataFactory.js'
import Order from '../../models/orderModel.js'
import User from '../../models/userModel.js'
import { dataIntegrityOrderData } from './test-data/orders.js'

const mockStripeAdapter = {
  createCheckoutSession: jest.fn().mockResolvedValue('https://stripe.test/session')
}

jest.unstable_mockModule('../../modules/Payment/stripeAdapter.js', () => ({
  __esModule: true,
  default: mockStripeAdapter
}))

const { default: placeOrderService } = await import('../../modules/Orders/placeOrder/Service.js')

describe('Data Integrity · Orders schema (CSV aligned)', () => {
  beforeAll(async () => {
    process.env.FRONTEND_URL = 'http://localhost:5173'
    await connectInMemoryMongo()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
    jest.clearAllMocks()
  })

  it('DAT_ORDE_DI_01 · deleting a user keeps historical orders intact', async () => {
    const user = await createUser()
    const order = await Order.create({
      userId: user._id.toString(),
      items: [{ _id: 'food-keep', name: 'History Meal', price: 10, quantity: 1 }],
      amount: 10,
      address: dataIntegrityOrderData.buildAddress()
    })

    await User.deleteOne({ _id: user._id })

    const persisted = await Order.findById(order._id).lean()
    expect(persisted).toBeTruthy()
    expect(persisted.userId).toBe(user._id.toString())
  })

  it('DAT_ORDE_DI_02 · cascaded deletes should never wipe past order entries', async () => {
    const user = await createUser()
    const order = await Order.create({
      userId: user._id.toString(),
      items: [{ _id: 'food-keep2', name: 'History Meal 2', price: 12, quantity: 1 }],
      amount: 12,
      address: dataIntegrityOrderData.buildAddress()
    })

    await User.findByIdAndDelete(user._id)

    const persisted = await Order.findById(order._id).lean()
    expect(persisted).toBeTruthy()
    expect(persisted.userId).toBe(order.userId)
  })

  it('DAT_ORDE_DI_03 · placeOrder rejects items that reference non-existing Food IDs', async () => {
    const user = await createUser()

    await expect(
      placeOrderService.placeOrder(
        user._id,
        [dataIntegrityOrderData.ghostFood],
        15,
        dataIntegrityOrderData.buildAddress(),
        dataIntegrityOrderData.frontendUrl
      )
    ).rejects.toThrow(/not found/i)
  })

  it('DAT_ORDE_DI_04 · direct inserts with fake FoodID should be rejected by schema rules', async () => {
    await expect(
      Order.create({
        userId: 'user-fake-food',
        items: [dataIntegrityOrderData.phantomItem],
        amount: 20,
        address: dataIntegrityOrderData.buildAddress()
      })
    ).rejects.toThrow(/food id/i)
  })

  it('DAT_ORDE_DI_05 · amount must equal sum(items) when persisting orders', async () => {
    const user = await createUser()
    const food = await createFood({ price: 10, stock: 5 })

    await expect(
      placeOrderService.placeOrder(
        user._id,
        [{ _id: food._id, name: food.name, price: food.price, quantity: 2 }],
        999,
        dataIntegrityOrderData.buildAddress(),
        dataIntegrityOrderData.frontendUrl
      )
    ).rejects.toThrow(/total/i)
  })

  it('DAT_ORDE_DI_06 · manual amount mismatches against item sum should be blocked', async () => {
    await expect(
      Order.create({
        userId: 'user-mismatch',
        items: dataIntegrityOrderData.mismatchItems,
        amount: 50,
        address: dataIntegrityOrderData.buildAddress()
      })
    ).rejects.toThrow(/total/i)
  })
})
