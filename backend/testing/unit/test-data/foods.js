export const foodUnitData = {
  creationPayloads: {
    missingName: {
      name: '',
      description: 'Missing name fails',
      price: 10,
      category: 'Soup',
      stock: 1
    }
  },
  listFilters: () => ({ category: 'Burger', name: /Pizza/i }),
  protectedInventory: () => ({
    _id: 'food-protected',
    image: 'protected.png',
    hasOpenOrders: true
  })
}
