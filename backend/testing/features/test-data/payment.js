export const paymentFeatureData = {
  frontendUrl: 'http://localhost:4173',
  order: {
    _id: 'order-feature-1',
    items: [
      { name: 'Feature Burger', price: 15, quantity: 2 },
      { name: 'Feature Fries', price: 5, quantity: 1 }
    ]
  },
  checkout: {
    sessionUrl: 'https://stripe.test/session'
  },
  webhook: {
    rawBody: 'raw-body',
    signature: 'sig_header',
    invalidRaw: 'raw',
    invalidSignature: 'sig'
  }
}
