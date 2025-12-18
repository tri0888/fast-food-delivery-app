import { uniqueSeed } from './common.js'

export const cartFeatureData = {
  buildUser: (overrides = {}) => ({
    name: 'Cart User',
    email: `cart+${uniqueSeed()}@example.com`,
    password: 'Password123!',
    cartData: {},
    ...overrides
  }),
  buildFood: (overrides = {}) => ({
    name: `Cart Food ${uniqueSeed()}`,
    description: 'Cart spec food',
    price: 7,
    image: 'cart-food.jpg',
    category: 'Sides',
    stock: 10,
    ...overrides
  })
}
