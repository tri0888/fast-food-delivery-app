export const dataIntegrityFoodData = {
  baseFood: () => ({
    name: 'Integrity Pho',
    description: 'CSV-mapped baseline row',
    price: 25,
    image: 'pho.jpg',
    category: 'Pho'
  }),
  buildLongName: (length = 256) => 'X'.repeat(length)
}
