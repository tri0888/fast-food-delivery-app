import { describe, it, expect, jest } from '@jest/globals'
import AppError from '../../../utils/appError.js'
import { cartUnitData } from '../test-data/carts.js'

const mockCartRepository = {
  findUserById: jest.fn(),
  findFoodById: jest.fn(),
  create: jest.fn()
}

jest.unstable_mockModule('../../../modules/Carts/addToCart/Repository.js', () => ({
  __esModule: true,
  default: mockCartRepository
}))

const mockCartService = {
  getCart: jest.fn()
}

jest.unstable_mockModule('../../../modules/Carts/getCart/Service.js', () => ({
  __esModule: true,
  default: mockCartService
}))

const { default: addToCartService } = await import('../../../modules/Carts/addToCart/Service.js')
const { getCart } = await import('../../../modules/Carts/getCart/Controller.js')

describe('Unit · Cart surface', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('UNI_CART_UNIT_01 · pushes new entry when item absent', async () => {
    const user = cartUnitData.userWithoutItem()
    const food = cartUnitData.foodTargets.fresh()
    const expectedCart = { [food._id]: 1 }

    mockCartRepository.findUserById.mockResolvedValue(user)
    mockCartRepository.findFoodById.mockResolvedValue(food)
    mockCartRepository.create.mockResolvedValue({ cartData: expectedCart })

    await addToCartService.createCart(user._id, food._id)

    expect(mockCartRepository.create).toHaveBeenCalledWith(user._id, expectedCart)
  })

  it('UNI_CART_UNIT_02 · increments quantity when item exists', async () => {
    const user = cartUnitData.userWithExistingItem()
    const food = cartUnitData.foodTargets.existing()
    const nextCart = { [food._id]: user.cartData[food._id] + 1 }

    mockCartRepository.findUserById.mockResolvedValue(user)
    mockCartRepository.findFoodById.mockResolvedValue(food)
    mockCartRepository.create.mockResolvedValue({ cartData: nextCart })

    await addToCartService.createCart(user._id, food._id)

    expect(mockCartRepository.create).toHaveBeenCalledWith(user._id, nextCart)
  })

  it('UNI_CART_UNIT_03 / UNI_CART_UNIT_04 · controller should normalize null cart data to empty object', async () => {
    const req = { body: { userId: 'user-null-cart' } }
    const json = jest.fn()
    const res = { json }
    const next = jest.fn()

    mockCartService.getCart.mockResolvedValue({ cartData: null, isCartLocked: false })

    await getCart(req, res, next)

    expect(json).toHaveBeenCalledWith(cartUnitData.normalizedResponse)
  })
})
