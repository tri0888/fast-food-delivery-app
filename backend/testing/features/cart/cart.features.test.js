import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../../fixtures/mongo.js'
import User from '../../../models/userModel.js'
import Food from '../../../models/foodModel.js'
import AppError from '../../../utils/appError.js'

const { default: addToCartService } = await import('../../../modules/Carts/addToCart/Service.js')
const { default: removeFromCartService } = await import('../../../modules/Carts/removeFromCart/Service.js')
const { default: getCartService } = await import('../../../modules/Carts/getCart/Service.js')

describe('Features · Cart capability', () => {
  beforeAll(async () => {
    await connectInMemoryMongo()
  })

  afterAll(async () => {
    await disconnectInMemoryMongo()
  })

  afterEach(async () => {
    await resetDatabase()
  })

  const createUserWithCart = async (cartData = {}) => {
    return User.create({
      name: 'Cart User',
      email: `cart+${Date.now()}@example.com`,
      password: 'Password123!',
      cartData
    })
  }

  const createFoodItem = async (overrides = {}) => {
    return Food.create({
      name: `Cart Food ${Date.now()}`,
      description: 'Cart spec food',
      price: 7,
      image: 'cart-food.jpg',
      category: 'Sides',
      stock: 10,
      ...overrides
    })
  }

  it('adds fresh items and increments existing ones', async () => {
    const food = await createFoodItem()
    const user = await createUserWithCart()

    await addToCartService.createCart(user._id.toString(), food._id.toString())
    await addToCartService.createCart(user._id.toString(), food._id.toString())

    const stored = await User.findById(user._id).lean()
    expect(stored.cartData[food._id.toString()]).toBe(2)
  })

  it('removes quantities and deletes entries when reaching zero', async () => {
    const food = await createFoodItem()
    const user = await createUserWithCart({ [food._id.toString()]: 2 })

    await removeFromCartService.removeFromCart(user._id.toString(), food._id.toString(), false)
    let stored = await User.findById(user._id).lean()
    expect(stored.cartData[food._id.toString()]).toBe(1)

    await removeFromCartService.removeFromCart(user._id.toString(), food._id.toString(), false)
    stored = await User.findById(user._id).lean()
    expect(stored.cartData[food._id.toString()]).toBeUndefined()
  })

  it('supports removing an item entirely', async () => {
    const food = await createFoodItem()
    const user = await createUserWithCart({ [food._id.toString()]: 3 })

    await removeFromCartService.removeFromCart(user._id.toString(), food._id.toString(), true)
    const stored = await User.findById(user._id).lean()
    expect(stored.cartData[food._id.toString()]).toBeUndefined()
  })

  it('returns cart data + lock status', async () => {
    const food = await createFoodItem()
    const user = await createUserWithCart({ [food._id.toString()]: 1 })
    user.isCartLock = true
    await user.save()

    const response = await getCartService.getCart(user._id.toString())
    expect(response.cartData[food._id.toString()]).toBe(1)
    expect(response.isCartLocked).toBe(true)
  })

  it('rejects operations for missing users or foods', async () => {
    const user = await createUserWithCart()
    const food = await createFoodItem()

    await expect(addToCartService.createCart('000000000000000000000000', food._id.toString())).rejects.toBeInstanceOf(AppError)
    await expect(addToCartService.createCart(user._id.toString(), '000000000000000000000000')).rejects.toBeInstanceOf(AppError)
  })
})
