import { buildEmail } from './common.js'

export const cartApiData = {
  buildUserEmail: (tag = 'user') => buildEmail(`cart-${tag}`),
  foodNames: {
    starter: 'API Cart Starter',
    increment: 'API Cart Increment',
    remove: 'API Cart Remove',
    totalEntree: 'Cart Entree',
    totalDrink: 'Cart Drink',
    negative: 'API Cart Negative',
    autoRemove: 'API Cart Auto Remove',
    privacy: 'API Cart Privacy',
    limit: 'API Cart Limit'
  },
  prices: {
    entree: 15,
    drink: 4
  },
  invalidQuantity: -3,
  quantityLimit: 2
}
