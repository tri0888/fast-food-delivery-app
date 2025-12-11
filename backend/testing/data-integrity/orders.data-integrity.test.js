import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import Order from '../../models/orderModel.js'
import Food from '../../models/foodModel.js'
import AppError from '../../utils/appError.js'

const { default: verifyOrderService } = await import('../../modules/Orders/verifyOrder/Service.js')

const buildAddress = () => ({
  firstName: 'Data',
  lastName: 'Integrity',
  phone: '+84 900 000 000',
  city: 'Ho Chi Minh',
  state: '1',
  zipcode: '700000',
  country: 'Vietnam'
})

describe('Data Integrity · Orders schema', () => {
  beforeAll(async () => {
    await connectInMemoryMongo()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
  })

  it('applies Food Processing + unpaid defaults', async () => {
    const stored = await Order.create({
      userId: 'user-1',
      items: [{ _id: 'food-1', name: 'Pho', price: 10, quantity: 1 }],
      amount: 10,
      address: buildAddress()
    })

    expect(stored.status).toBe('Food Processing')
    expect(stored.payment).toBe(false)
    expect(stored.date).toBeInstanceOf(Date)
  })

  it.each([
    ['userId'],
    ['items'],
    ['amount'],
    ['address']
  ])('requires %s to persist an order', async (field) => {
    const payload = {
      userId: 'user-2',
      items: [{ _id: 'food', name: 'Banh mi', quantity: 1, price: 5 }],
      amount: 5,
      address: buildAddress()
    }
    delete payload[field]

    const matcher = field === 'items' ? /must contain/i : /must have/i
    await expect(Order.create(payload)).rejects.toThrow(matcher)
  })

  it('restores inventory and deletes order when payment fails', async () => {
    const food = await Food.create({
      name: 'Integrity Pizza',
      description: 'Data pizza',
      price: 12,
      image: 'pizza.jpg',
      category: 'Pizza',
      stock: 0
    })

    const order = await Order.create({
      userId: 'user-restore',
      items: [{ _id: food._id, name: food.name, price: food.price, quantity: 2 }],
      amount: 24,
      address: buildAddress()
    })

    const response = await verifyOrderService.verifyOrder(order._id.toString(), 'false')
    expect(response).toEqual({ success: false, message: 'Not Paid' })

    const removed = await Order.findById(order._id)
    expect(removed).toBeNull()

    const refreshedFood = await Food.findById(food._id).lean()
    expect(refreshedFood.stock).toBe(2)
  })

  it('throws when verifying without an order id', async () => {
    await expect(verifyOrderService.verifyOrder(undefined, 'true')).rejects.toBeInstanceOf(AppError)
  })
})
