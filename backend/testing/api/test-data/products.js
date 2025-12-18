export const productApiData = {
  baseFoodPayload: (overrides = {}) => ({
    name: 'Matrix Pho',
    description: 'CSV baseline food',
    price: 12,
    category: 'Pho',
    stock: 5,
    ...overrides
  }),
  sampleImageBuffer: Buffer.from('fast-food-matrix-image'),
  defaultImageName: 'matrix.png',
  invalidImageName: 'invalid.txt'
}
