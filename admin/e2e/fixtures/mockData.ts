export function buildMockUsers() {
  return [
    {
      _id: 'user-1',
      name: 'Alice Automation',
      email: 'alice.automation@example.com',
      cartData: {
        pizza: 2,
        burger: 1
      },
      isCartLock: false
    },
    {
      _id: 'user-2',
      name: 'Benny Baseline',
      email: 'benny.baseline@example.com',
      cartData: {
        salad: 1
      },
      isCartLock: true
    }
  ]
}

export function buildMockOrders(status = 'Food Processing') {
  return [
    {
      _id: 'order-1',
      items: [
        { name: 'Telemetry Taco', quantity: 2 },
        { name: 'Latency Latte', quantity: 1 }
      ],
      amount: 48,
      status,
      address: {
        firstName: 'Casey',
        lastName: 'Courier',
        phone: '+1 555-0123',
        city: 'Observability',
        state: 'QA',
        zipcode: '12345',
        country: 'Automation'
      }
    }
  ]
}
