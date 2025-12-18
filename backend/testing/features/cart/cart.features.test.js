import { beforeAll, afterAll, afterEach, describe, it, expect } from '@jest/globals'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../../fixtures/mongo.js'
import User from '../../../models/userModel.js'
import Food from '../../../models/foodModel.js'
import AppError from '../../../utils/appError.js'
import { cartFeatureData } from '../test-data/cart.js'
import { featureNullObjectId } from '../test-data/common.js'

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
    return User.create(cartFeatureData.buildUser({ cartData }))
  }

  const createFoodItem = async (overrides = {}) => {
    return Food.create(cartFeatureData.buildFood(overrides))
  }

  it('FE-CART-001 · adds fresh items and increments existing ones', async () => {
    const food = await createFoodItem()
    const user = await createUserWithCart()

    await addToCartService.createCart(user._id.toString(), food._id.toString())
    await addToCartService.createCart(user._id.toString(), food._id.toString())

    const stored = await User.findById(user._id).lean()
    expect(stored.cartData[food._id.toString()]).toBe(2)
  })

  it('FE-CART-002 · removes quantities and deletes entries when reaching zero', async () => {
    const food = await createFoodItem()
    const user = await createUserWithCart({ [food._id.toString()]: 2 })

    await removeFromCartService.removeFromCart(user._id.toString(), food._id.toString(), false)
    let stored = await User.findById(user._id).lean()
    expect(stored.cartData[food._id.toString()]).toBe(1)

    await removeFromCartService.removeFromCart(user._id.toString(), food._id.toString(), false)
    stored = await User.findById(user._id).lean()
    expect(stored.cartData[food._id.toString()]).toBeUndefined()
  })

  it('FE-CART-003 · supports removing an item entirely', async () => {
    const food = await createFoodItem()
    const user = await createUserWithCart({ [food._id.toString()]: 3 })

    await removeFromCartService.removeFromCart(user._id.toString(), food._id.toString(), true)
    const stored = await User.findById(user._id).lean()
    expect(stored.cartData[food._id.toString()]).toBeUndefined()
  })

  it('FE-CART-004 · returns cart data + lock status', async () => {
    const food = await createFoodItem()
    const user = await createUserWithCart({ [food._id.toString()]: 1 })
    user.isCartLock = true
    await user.save()

    const response = await getCartService.getCart(user._id.toString())
    expect(response.cartData[food._id.toString()]).toBe(1)
    expect(response.isCartLocked).toBe(true)
  })

  it('FE-CART-005 · rejects add-to-cart when user does not exist', async () => {
    const food = await createFoodItem()

    await expect(addToCartService.createCart(featureNullObjectId, food._id.toString())).rejects.toBeInstanceOf(AppError)
  })

  it('FE-CART-006 · rejects add-to-cart when food does not exist', async () => {
    const user = await createUserWithCart()

    await expect(addToCartService.createCart(user._id.toString(), featureNullObjectId)).rejects.toBeInstanceOf(AppError)
  })
})
