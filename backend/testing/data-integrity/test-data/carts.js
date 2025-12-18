export const dataIntegrityCartData = {
  buildCartPayload: () => ({
    phantomFood: 2,
    ['item-' + Date.now()]: 1
  })
}
