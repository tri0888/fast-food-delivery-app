import { describe, it, expect, jest } from '@jest/globals'
import AppError from '../../../utils/appError.js'
import { orderUnitData } from '../test-data/orders.js'

const mockPlaceRepository = {
  findUserById: jest.fn(),
  findFoodById: jest.fn(),
  reserveStock: jest.fn(),
  restoreStock: jest.fn(),
  createOrder: jest.fn(),
  clearUserCart: jest.fn()
}

jest.unstable_mockModule('../../../modules/Orders/placeOrder/Repository.js', () => ({
  __esModule: true,
  default: mockPlaceRepository
}))

const mockStripeAdapter = {
  createCheckoutSession: jest.fn()
}

jest.unstable_mockModule('../../../modules/Payment/stripeAdapter.js', () => ({
  __esModule: true,
  default: mockStripeAdapter
}))

const mockUpdateRepository = {
  findOrderById: jest.fn(),
  updateStatus: jest.fn()
}

jest.unstable_mockModule('../../../modules/Orders/updateStatus/Repository.js', () => ({
  __esModule: true,
  default: mockUpdateRepository
}))

const mockVerifyRepository = {
  updatePaymentStatus: jest.fn(),
  findById: jest.fn(),
  restoreStock: jest.fn(),
  deleteById: jest.fn()
}

jest.unstable_mockModule('../../../modules/Orders/verifyOrder/Repository.js', () => ({
  __esModule: true,
  default: mockVerifyRepository
}))

const { default: placeOrderService } = await import('../../../modules/Orders/placeOrder/Service.js')
const { default: updateStatusService } = await import('../../../modules/Orders/updateStatus/Service.js')
const { default: verifyOrderService } = await import('../../../modules/Orders/verifyOrder/Service.js')

describe('Unit · Order surface', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('UNI_ORDE_UNIT_01 / UNI_ORDE_UNIT_02 · rolls back reserved stock when createOrder fails', async () => {
    const user = orderUnitData.rollbackUser()
    const food = orderUnitData.rollbackFood()
    const items = orderUnitData.rollbackItems()
    const address = orderUnitData.deliveryAddress()

    mockPlaceRepository.findUserById.mockResolvedValue(user)
    mockPlaceRepository.findFoodById.mockResolvedValue(food)
    mockPlaceRepository.reserveStock.mockResolvedValue()
    mockPlaceRepository.createOrder.mockRejectedValue(new Error('db down'))

    await expect(
      placeOrderService.placeOrder(
        user._id,
        items,
        20,
        address,
        orderUnitData.checkoutOrigin
      )
    ).rejects.toThrow('db down')

    expect(mockPlaceRepository.reserveStock).toHaveBeenCalledTimes(1)
    expect(mockPlaceRepository.restoreStock).toHaveBeenCalledWith(items)
    expect(mockStripeAdapter.createCheckoutSession).not.toHaveBeenCalled()
  })

  it('UNI_ORDE_UNIT_03 / UNI_ORDE_UNIT_04 · updateStatus enforces sequential transitions', async () => {
    mockUpdateRepository.findOrderById.mockResolvedValue(orderUnitData.sequentialOrder())
    mockUpdateRepository.updateStatus.mockImplementation((_, status) => ({ status }))

    await expect(updateStatusService.updateOrderStatus('order-flow', 'Delivered')).rejects.toBeInstanceOf(AppError)
  })

  it('UNI_ORDE_UNIT_05 / UNI_ORDE_UNIT_06 · verifyOrder compares OTP before marking paid', async () => {
    mockVerifyRepository.findById.mockResolvedValue(orderUnitData.otpOrder())

    await expect(verifyOrderService.verifyOrder('order-otp', 'true', '000000')).rejects.toBeInstanceOf(AppError)
    expect(mockVerifyRepository.updatePaymentStatus).not.toHaveBeenCalled()
  })
})
