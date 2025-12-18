import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { paymentFeatureData } from '../test-data/payment.js'

const checkoutCreateMock = jest.fn()
const constructEventMock = jest.fn()
const stripeConstructorMock = jest.fn().mockImplementation(() => ({
  checkout: {
    sessions: {
      create: checkoutCreateMock
    }
  },
  webhooks: {
    constructEvent: constructEventMock
  }
}))

jest.unstable_mockModule('stripe', () => ({
  __esModule: true,
  default: stripeConstructorMock
}))

process.env.STRIPE_SECRET_KEY = 'sk_test_feature_module'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_feature_module'

const { default: stripeAdapter } = await import('../../../modules/Payment/stripeAdapter.js')

describe('Features · Payment module', () => {
  beforeEach(() => {
    checkoutCreateMock.mockReset()
    constructEventMock.mockReset()
  })

  it('FE-PAY-001 · creates checkout sessions with delivery fees included', async () => {
    checkoutCreateMock.mockResolvedValue({ url: paymentFeatureData.checkout.sessionUrl })

    const { order, frontendUrl } = paymentFeatureData

    const sessionUrl = await stripeAdapter.createCheckoutSession(order, frontendUrl)

    expect(sessionUrl).toBe(paymentFeatureData.checkout.sessionUrl)
    expect(checkoutCreateMock).toHaveBeenCalledTimes(1)

    const payload = checkoutCreateMock.mock.calls[0][0]
    expect(payload.mode).toBe('payment')
    expect(payload.line_items).toHaveLength(order.items.length + 1)

    const lastItem = payload.line_items[payload.line_items.length - 1]
    expect(lastItem.price_data.product_data.name).toBe('Delivery Charges')
    expect(payload.success_url).toBe(`${frontendUrl}/verify?success=true&orderId=${order._id}`)
    expect(payload.cancel_url).toBe(`${frontendUrl}/verify?success=false&orderId=${order._id}`)
  })

  it('FE-PAY-002 · verifies webhook payloads with configured secret', () => {
    constructEventMock.mockReturnValue({ id: 'evt_feature' })

    const event = stripeAdapter.verifyWebhook(paymentFeatureData.webhook.rawBody, paymentFeatureData.webhook.signature)

    expect(event).toEqual({ id: 'evt_feature' })
    expect(constructEventMock).toHaveBeenCalledWith(
      paymentFeatureData.webhook.rawBody,
      paymentFeatureData.webhook.signature,
      'whsec_feature_module'
    )
  })

  it('FE-PAY-003 · throws when webhook secret is missing', () => {
    const originalSecret = process.env.STRIPE_WEBHOOK_SECRET
    delete process.env.STRIPE_WEBHOOK_SECRET

    expect(() => stripeAdapter.verifyWebhook(paymentFeatureData.webhook.invalidRaw, paymentFeatureData.webhook.invalidSignature))
      .toThrow('Stripe webhook secret not configured')

    process.env.STRIPE_WEBHOOK_SECRET = originalSecret
  })
})
