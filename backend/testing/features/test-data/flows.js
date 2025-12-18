import { uniqueSeed } from './common.js'

export const flowFeatureData = {
  frontendUrl: 'http://localhost:4173',
  buildUserEmail: (tag = 'flow-user') => `flow-${tag}+${uniqueSeed()}@example.com`,
  userPassword: 'FlowUser#123',
  adminPassword: 'AdminFlow#123',
  checkoutSessionUrl: 'https://stripe.test/flow-order',
  foods: {
    pho: {
      name: 'Flow Pho Deluxe',
      description: 'Herby broth',
      price: 15,
      image: 'pho.png',
      category: 'Vietnamese',
      stock: 5
    },
    burger: {
      name: 'Automation Burger',
      description: 'Script powered',
      price: 14,
      image: 'burger.png',
      category: 'Burger',
      stock: 6
    },
    adminSalad: {
      name: 'Admin Flow Salad',
      description: 'Synced from admin surface',
      price: 22,
      category: 'Salad',
      stock: 10,
      isAvailable: true
    }
  },
  checkoutAddress: { street: '123 Flow', city: 'Hanoi', country: 'VN' },
  cancelUser: {
    name: 'Cancel Flow User',
    password: 'Password123!'
  },
  cancelOrder: {
    items: [{ _id: 'flow-food', name: 'Flow Food', price: 10, quantity: 1 }],
    amount: 10,
    address: { street: 'Cancel', city: 'Flow City', country: 'VN' },
    status: 'Pending'
  }
}
