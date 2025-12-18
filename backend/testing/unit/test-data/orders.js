const deepClone = (value) => JSON.parse(JSON.stringify(value))

const rollbackItems = [{ _id: 'food-rb', name: 'Rollback Pho', price: 10, quantity: 2 }]
const deliveryAddress = { street: 'Rollback', city: 'HN', country: 'VN' }

export const orderUnitData = {
  rollbackUser: () => ({ _id: 'user-rollback' }),
  rollbackFood: () => ({ _id: 'food-rb', stock: 5 }),
  rollbackItems: () => deepClone(rollbackItems),
  deliveryAddress: () => ({ ...deliveryAddress }),
  checkoutOrigin: 'http://localhost:4173',
  sequentialOrder: () => ({ _id: 'order-flow', status: 'Pending' }),
  otpOrder: () => ({ _id: 'order-otp', otp: '123456', items: [] })
}
