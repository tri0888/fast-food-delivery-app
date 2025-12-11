import User from '../../models/userModel.js'
import Food from '../../models/foodModel.js'
import Order from '../../models/orderModel.js'

export async function createUser(overrides = {}) {
  return User.create({
    name: 'Taylor Test',
    email: `taylor+${Date.now()}@example.com`,
    password: 'Password123!',
    role: 'user',
    ...overrides
  })
}

export async function createFood(overrides = {}) {
  return Food.create({
    name: 'Playwright Pizza',
    description: 'Automation-fueled flavor',
    price: 12,
    image: 'playwright-pizza.jpg',
    category: 'Pizza',
    ...overrides
  })
}

export async function createOrder({ user, items = [], ...overrides } = {}) {
  const owner = user || await createUser()
  const foodItems = items.length ? items : [await createFood()]
  return Order.create({
    userId: owner._id,
    items: foodItems.map((food) => ({
      foodId: food._id,
      name: food.name,
      price: food.price,
      quantity: 1
    })),
    amount: foodItems.reduce((sum, food) => sum + food.price, 0),
    address: {
      firstName: 'Order',
      lastName: 'Bot',
      phone: '+1 555-0101',
      city: 'Test City',
      state: 'TS',
      zipcode: '00000',
      country: 'Automation'
    },
    status: 'Pending Confirmation',
    paymentStatus: 'pending',
    ...overrides
  })
}
