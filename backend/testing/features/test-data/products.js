export const productFeatureData = {
  buildPayload: (overrides = {}) => ({
    name: 'Spec Salad',
    description: 'Feature-informed salad',
    price: 9,
    category: 'Salad',
    stock: 5,
    isAvailable: true,
    ...overrides
  }),
  fakeFile: (filename = 'spec-salad.jpg') => ({ filename })
}
