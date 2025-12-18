export const dataIntegrityOrderData = {
  frontendUrl: 'http://localhost:4173',
  buildAddress: () => ({
    firstName: 'Data',
    lastName: 'Integrity',
    phone: '+84 900 000 000',
    city: 'Ho Chi Minh',
    state: '1',
    zipcode: '700000',
    country: 'Vietnam'
  }),
  ghostFood: { _id: '000000000000000000000000', name: 'Ghost Food', price: 15, quantity: 1 },
  phantomItem: { _id: 'fake-food', name: 'Phantom Item', price: 20, quantity: 1 },
  mismatchItems: [
    { _id: 'food-a', name: 'A', price: 5, quantity: 1 },
    { _id: 'food-b', name: 'B', price: 5, quantity: 1 }
  ]
}
