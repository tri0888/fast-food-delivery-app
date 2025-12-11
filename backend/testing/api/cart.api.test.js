import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import jwt from 'jsonwebtoken'
import { buildClient } from '../fixtures/app.js'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import User from '../../models/userModel.js'
import Food from '../../models/foodModel.js'

const buildToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET)

describe('API · /api/cart endpoints', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'api-cart-secret'
    await connectInMemoryMongo()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
  })

  it('requires authentication for reading cart data', async () => {
    const response = await buildClient().get('/api/cart/get')
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(false)
    expect(response.body.message).toMatch(/not authorized/i)
  })

  it('adds food items to the authenticated user cart and returns the updated payload', async () => {
    const user = await User.create({
      name: 'API Cart',
      email: 'api-cart@example.com',
      password: 'Password123!'
    })

    const food = await Food.create({
      name: 'Cart Taco',
      description: 'API Taco',
      price: 8,
      image: 'cart-taco.jpg',
      category: 'Taco'
    })

    const token = buildToken(user)

    const addResponse = await buildClient()
      .post('/api/cart/add')
      .set('token', token)
      .send({ itemId: food._id.toString() })

    expect(addResponse.status).toBe(200)
    expect(addResponse.body.success).toBe(true)

    const getResponse = await buildClient()
      .get('/api/cart/get')
      .set('token', token)

    expect(getResponse.status).toBe(200)
    expect(getResponse.body.success).toBe(true)
    expect(getResponse.body.cartData[food._id.toString()]).toBe(1)
  })

  it('rejects invalid food identifiers', async () => {
    const user = await User.create({
      name: 'Invalid Food',
      email: 'invalid-food@example.com',
      password: 'Password123!'
    })
    const token = buildToken(user)

    const response = await buildClient()
      .post('/api/cart/add')
      .set('token', token)
      .send({ itemId: '000000000000000000000000' })

    expect(response.status).toBe(404)
    expect(response.body.status).toBe('fail')
    expect(response.body.message).toMatch(/Food not found/i)
  })
})
