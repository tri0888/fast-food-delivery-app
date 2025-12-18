import { beforeAll, afterAll, afterEach, beforeEach, describe, it, expect } from '@jest/globals'
import jwt from 'jsonwebtoken'
import { buildClient } from '../fixtures/app.js'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../fixtures/mongo.js'
import { createUser, createFood } from '../fixtures/dataFactory.js'
import User from '../../models/userModel.js'
import { cartApiData } from './test-data/cart.js'

const buildToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET)

const addItemToCart = (user, food, quantity = 1) =>
  buildClient()
    .post('/api/cart/add')
    .set('token', buildToken(user))
    .send({ itemId: food._id.toString(), quantity })

const removeItemFromCart = (user, food, payload = {}) =>
  buildClient()
    .post('/api/cart/remove')
    .set('token', buildToken(user))
    .send({ itemId: food._id.toString(), ...payload })

const getCartForUser = (user, extraBody) => {
  const requestBuilder = buildClient()
    .get('/api/cart/get')
    .set('token', buildToken(user))

  return extraBody ? requestBuilder.send(extraBody) : requestBuilder
}

describe('API · /api/cart endpoints', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'api-cart-secret'
    process.env.CART_ITEM_MAX_QTY = '5'
    await connectInMemoryMongo()
  })

  beforeEach(() => {
    process.env.CART_ITEM_MAX_QTY = '5'
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
  })

  it('API_CART_01 · creates a cart when adding the first item', async () => {
    const user = await createUser({ email: cartApiData.buildUserEmail('01') })
    const food = await createFood({ name: cartApiData.foodNames.starter })

    const response = await addItemToCart(user, food)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)

    const updatedUser = await User.findById(user._id).lean()
    expect(updatedUser.cartData[food._id.toString()]).toBe(1)
  })

  it('API_CART_02 · increments quantity when adding a duplicate item', async () => {
    const user = await createUser({ email: cartApiData.buildUserEmail('02') })
    const food = await createFood({ name: cartApiData.foodNames.increment })

    await addItemToCart(user, food)
    await addItemToCart(user, food)

    const reloaded = await User.findById(user._id).lean()
    expect(reloaded.cartData[food._id.toString()]).toBe(2)
  })

  it('API_CART_03 · removes products from the cart when requested', async () => {
    const user = await createUser({ email: cartApiData.buildUserEmail('03') })
    const food = await createFood({ name: cartApiData.foodNames.remove })

    await addItemToCart(user, food)
    const response = await removeItemFromCart(user, food, { removeCompletely: true })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)

    const reloaded = await User.findById(user._id).lean()
    const cartData = reloaded.cartData || {}
    expect(cartData[food._id.toString()]).toBeUndefined()
  })

  it('API_CART_04 · returns total amount when fetching cart data', async () => {
    const user = await createUser({ email: cartApiData.buildUserEmail('04') })
    const entree = await createFood({ name: cartApiData.foodNames.totalEntree, price: cartApiData.prices.entree })
    const drink = await createFood({ name: cartApiData.foodNames.totalDrink, price: cartApiData.prices.drink })

    await addItemToCart(user, entree, 2)
    await addItemToCart(user, drink, 3)

    const response = await getCartForUser(user)

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.cartData[entree._id.toString()]).toBe(2)
    expect(response.body.cartData[drink._id.toString()]).toBe(3)
    expect(response.body.totalAmount).toBe(2 * 15 + 3 * 4)
    expect(response.body.totalAmount).toBe(2 * cartApiData.prices.entree + 3 * cartApiData.prices.drink)
  })

  it('API_CART_05 · rejects negative quantities', async () => {
    const user = await createUser({ email: cartApiData.buildUserEmail('05') })
    const food = await createFood({ name: cartApiData.foodNames.negative })

    const response = await addItemToCart(user, food, cartApiData.invalidQuantity)

    expect(response.status).toBe(400)
    expect(response.body.status).toBe('fail')
    expect(response.body.message).toMatch(/quantity must be a positive integer/i)
  })

  it('API_CART_06 · automatically removes items when quantity hits zero', async () => {
    const user = await createUser({ email: cartApiData.buildUserEmail('06') })
    const food = await createFood({ name: cartApiData.foodNames.autoRemove })

    await addItemToCart(user, food)
    const response = await removeItemFromCart(user, food)

    expect(response.status).toBe(200)

    const reloaded = await User.findById(user._id).lean()
    const cartData = reloaded.cartData || {}
    expect(cartData[food._id.toString()]).toBeUndefined()
  })

  it('API_CART_07 · prevents one user from reading another user cart payload', async () => {
    const owner = await createUser({ email: cartApiData.buildUserEmail('owner') })
    const snooper = await createUser({ email: cartApiData.buildUserEmail('snoop') })
    const food = await createFood({ name: cartApiData.foodNames.privacy })

    await addItemToCart(owner, food, 2)

    const response = await getCartForUser(snooper, { userId: owner._id.toString() })

    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.cartData).toEqual({})
    expect(response.body.totalAmount).toBe(0)
  })

  it('API_CART_08 · enforces per-item quantity limits', async () => {
    const user = await createUser({ email: cartApiData.buildUserEmail('08') })
    const food = await createFood({ name: cartApiData.foodNames.limit })
    const originalMax = process.env.CART_ITEM_MAX_QTY

    try {
      process.env.CART_ITEM_MAX_QTY = '2'
      process.env.CART_ITEM_MAX_QTY = String(cartApiData.quantityLimit)
      const firstAttempt = await addItemToCart(user, food, cartApiData.quantityLimit)
      expect(firstAttempt.status).toBe(200)

      const response = await addItemToCart(user, food, 1)
      expect(response.status).toBe(400)
      expect(response.body.message).toMatch(new RegExp(`cannot add more than ${cartApiData.quantityLimit}`, 'i'))
    } finally {
      process.env.CART_ITEM_MAX_QTY = originalMax
    }
  })
})
