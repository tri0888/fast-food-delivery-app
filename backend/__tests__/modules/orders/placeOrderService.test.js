import { jest } from '@jest/globals'
import orderService from '../../../modules/Orders/placeOrder/Service.js'
import orderRepository from '../../../modules/Orders/placeOrder/Repository.js'
import stripeAdapter from '../../../modules/Payment/stripeAdapter.js'
import AppError from '../../../utils/appError.js'

const buildAddress = (overrides = {}) => ({
  firstName: 'John',
  lastName: 'Doe',
  phone: '123456789',
  street: '123 Test St',
  city: 'Ho Chi Minh',
  state: 'District 1',
  ward: 'Ben Nghe',
  country: 'Vietnam',
  location: {
    lat: 10.78,
    lng: 106.7,
    label: '123 Test St, HCM',
    confirmed: true,
    confirmedAt: new Date().toISOString(),
    ...overrides.location
  },
  ...overrides
})

const buildFood = ({ id, restaurantId, price, stock = 5, name }) => ({
  _id: id,
  name,
  price,
  stock,
  res_id: restaurantId,
  image: `${name}.jpg`
})

describe('OrderService.placeOrder (multi-tenant)', () => {
  const userId = 'user-001'
  const anotherUserId = 'user-002'
  const frontendUrl = 'http://localhost:5173'
  const restaurantA = 'rest-a'
  const restaurantB = 'rest-b'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('splits cart items per restaurant and creates checkout session', async () => {
    jest.spyOn(orderRepository, 'findUserById').mockResolvedValue({ _id: anotherUserId })
    jest.spyOn(orderRepository, 'findFoodsByIds').mockResolvedValue([
      buildFood({ id: 'food-1', restaurantId: restaurantA, price: 5, name: 'Pho' }),
      buildFood({ id: 'food-2', restaurantId: restaurantB, price: 7, name: 'Banh Mi' })
    ])
    jest.spyOn(orderRepository, 'reserveStock').mockResolvedValue(true)
    jest.spyOn(orderRepository, 'createOrders').mockResolvedValue([
      { _id: 'order-a', res_id: restaurantA },
      { _id: 'order-b', res_id: restaurantB }
    ])
    jest.spyOn(orderRepository, 'attachStripeDetails').mockResolvedValue(true)
    jest.spyOn(orderRepository, 'deleteOrders').mockResolvedValue()
    jest.spyOn(orderRepository, 'restoreStock').mockResolvedValue()
    jest.spyOn(stripeAdapter, 'createCheckoutSession').mockResolvedValue({
      url: 'https://stripe.example/checkout',
      sessionId: 'sess_123',
      paymentIntentId: 'pi_123'
    })

    const items = [
      { foodId: 'food-1', quantity: 1 },
      { foodId: 'food-2', quantity: 2 }
    ]
    const subtotal = 5 * 1 + 7 * 2
    const amount = subtotal + 2
    const address = buildAddress()

    const result = await orderService.placeOrder(userId, items, amount, address, frontendUrl)

    expect(result).toEqual({ session_url: 'https://stripe.example/checkout' })
    expect(orderRepository.reserveStock).toHaveBeenCalledTimes(2)
    expect(orderRepository.createOrders).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ res_id: restaurantA, food_items: expect.any(Array) }),
        expect.objectContaining({ res_id: restaurantB, food_items: expect.any(Array) })
      ])
    )
    expect(stripeAdapter.createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        deliveryFee: 2,
        frontendUrl,
        items: expect.arrayContaining([
          expect.objectContaining({ name: 'Pho', quantity: 1 }),
          expect.objectContaining({ name: 'Banh Mi', quantity: 2 })
        ])
      })
    )
    expect(orderRepository.attachStripeDetails).toHaveBeenCalledWith(
      ['order-a', 'order-b'],
      { sessionId: 'sess_123', paymentIntentId: 'pi_123' }
    )
  })

  it('throws when delivery pin is not confirmed', async () => {
    jest.spyOn(orderRepository, 'findUserById').mockResolvedValue({ _id: userId })

    await expect(
      orderService.placeOrder(
        anotherUserId,
        [{ foodId: 'food-1', quantity: 1 }],
        10,
        buildAddress({ location: { lat: 10.78, lng: 106.7, confirmed: false } }),
        frontendUrl
      )
    ).rejects.toBeInstanceOf(AppError)
  })
})
