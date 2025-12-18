export const uniqueSeed = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

export const buildEmail = (prefix = 'api') => `csv-${prefix}-${uniqueSeed()}@example.com`

export const passwords = Object.freeze({
  strong: 'Password123!',
  weak: '12345',
  wrong: 'WrongPass999!'
})

export const addressTemplate = Object.freeze({
  street: 'CSV Matrix St',
  city: 'Ho Chi Minh',
  state: 'SG',
  zipcode: '700000',
  country: 'Vietnam'
})

export const cloneAddress = () => ({ ...addressTemplate })

export const nullObjectId = '000000000000000000000000'
