import { beforeAll, afterAll, afterEach, describe, it, expect, jest } from '@jest/globals'
import { connectInMemoryMongo, disconnectInMemoryMongo, resetDatabase } from '../../fixtures/mongo.js'
import User from '../../../models/userModel.js'
import Food from '../../../models/foodModel.js'
import Order from '../../../models/orderModel.js'
import { flowFeatureData } from '../test-data/flows.js'

const mockStripeAdapter = {
  createCheckoutSession: jest.fn()
}

jest.unstable_mockModule('../../../modules/Payment/stripeAdapter.js', () => ({
  __esModule: true,
  default: mockStripeAdapter
}))

const { default: registerService } = await import('../../../modules/Users/register/Service.js')
const { default: loginService } = await import('../../../modules/Users/login/Service.js')
const { default: addFoodService } = await import('../../../modules/Foods/addFood/Service.js')
const { default: listFoodService } = await import('../../../modules/Foods/listFood/Service.js')
const { default: addToCartService } = await import('../../../modules/Carts/addToCart/Service.js')
const { default: placeOrderService } = await import('../../../modules/Orders/placeOrder/Service.js')
const { default: updateStatusService } = await import('../../../modules/Orders/updateStatus/Service.js')

describe('Feature · Flow coverage', () => {
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

  it('FEA_FLOW_FEAT_01 + FEA_FLOW_FEAT_04 · User registers, logs in, searches, adds cart, checks out', async () => {
    const email = flowFeatureData.buildUserEmail('user')
    const password = flowFeatureData.userPassword

    const registerResponse = await registerService.register('Flow User', email, password)
    expect(registerResponse.token).toEqual(expect.any(String))

    const storedUser = await User.findOne({ email }).lean()
    expect(storedUser).toBeTruthy()

    const loginResponse = await loginService.login(email, password)
    expect(loginResponse.role).toBe('user')

    const [pho, burger] = await Food.create([flowFeatureData.foods.pho, flowFeatureData.foods.burger])

    const catalog = await listFoodService.getAllFoods()
    const searchResults = catalog.filter((food) => food.name.toLowerCase().includes('pho'))
    expect(searchResults.map((food) => food.name)).toContain('Flow Pho Deluxe')

    await addToCartService.createCart(storedUser._id.toString(), pho._id.toString())
    const refreshedUser = await User.findById(storedUser._id).lean()
    expect(refreshedUser.cartData[pho._id.toString()]).toBe(1)

    mockStripeAdapter.createCheckoutSession.mockResolvedValue(flowFeatureData.checkoutSessionUrl)

    const lineItems = [
      {
        _id: pho._id,
        name: pho.name,
        price: pho.price,
        quantity: 1
      }
    ]

    const orderResponse = await placeOrderService.placeOrder(
      storedUser._id.toString(),
      lineItems,
      pho.price,
      flowFeatureData.checkoutAddress,
      flowFeatureData.frontendUrl
    )

    expect(orderResponse.session_url).toBe(flowFeatureData.checkoutSessionUrl)

    const storedOrder = await Order.findOne({ userId: storedUser._id }).lean()
    expect(storedOrder.items[0].name).toBe('Flow Pho Deluxe')
    expect(mockStripeAdapter.createCheckoutSession).toHaveBeenCalledTimes(1)
  })

  it('FEA_FLOW_FEAT_02 + FEA_FLOW_FEAT_05 · Admin adds food and customers can list it', async () => {
    const adminEmail = flowFeatureData.buildUserEmail('admin')
    const password = flowFeatureData.adminPassword

    await registerService.register('Admin Flow', adminEmail, password)
    await User.updateOne({ email: adminEmail }, { role: 'admin' })

    const loginResponse = await loginService.login(adminEmail, password)
    expect(loginResponse.role).toBe('admin')

    const created = await addFoodService.createFood(flowFeatureData.foods.adminSalad, { filename: 'flow-salad.png' })
    expect(created.name).toBe(flowFeatureData.foods.adminSalad.name)

    const catalog = await listFoodService.getAllFoods()
    expect(catalog.some((food) => food.name === flowFeatureData.foods.adminSalad.name)).toBe(true)
  })

  it('FEA_FLOW_FEAT_03 + FEA_FLOW_FEAT_06 · User cancel request should surface status to admin', async () => {
    const user = await User.create({
      name: flowFeatureData.cancelUser.name,
      email: flowFeatureData.buildUserEmail('cancel'),
      password: flowFeatureData.cancelUser.password,
      role: 'user'
    })

    const order = await Order.create({
      userId: user._id,
      items: flowFeatureData.cancelOrder.items,
      amount: flowFeatureData.cancelOrder.amount,
      address: flowFeatureData.cancelOrder.address,
      status: flowFeatureData.cancelOrder.status
    })

    await updateStatusService.updateOrderStatus(order._id.toString(), 'Cancelled')
    const updated = await Order.findById(order._id).lean()
    expect(updated.status).toBe('Cancelled')
  })
})
