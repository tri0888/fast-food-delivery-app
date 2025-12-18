import { buildEmail, cloneAddress } from './common.js'

export const orderApiData = {
  buildUserEmail: (tag = 'user') => buildEmail(`orders-${tag}`),
  address: () => cloneAddress(),
  menuItems: {
    combo: { name: 'Order Matrix Combo', price: 20 },
    ownerMeal: { name: 'Owner Meal', price: 12 },
    otherMeal: { name: 'Other Meal', price: 9 },
    pending: { name: 'Matrix Pending', price: 15 },
    skip: { name: 'Matrix Skip', price: 18 },
    delivery: { name: 'Matrix Delivery', price: 22 },
    verify: { name: 'Matrix Verify', price: 30 }
  }
}
