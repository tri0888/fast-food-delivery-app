const clone = (value) => JSON.parse(JSON.stringify(value))

const baseUsers = {
  withoutItem: { _id: 'user-1', cartData: {} },
  withExistingItem: { _id: 'user-2', cartData: { 'food-10': 2 } }
}

const baseFoods = {
  fresh: { _id: 'food-9' },
  existing: { _id: 'food-10' }
}

export const cartUnitData = {
  userWithoutItem: () => clone(baseUsers.withoutItem),
  userWithExistingItem: () => clone(baseUsers.withExistingItem),
  foodTargets: {
    fresh: () => clone(baseFoods.fresh),
    existing: () => clone(baseFoods.existing)
  },
  normalizedResponse: {
    success: true,
    cartData: {},
    isCartLocked: false
  }
}
