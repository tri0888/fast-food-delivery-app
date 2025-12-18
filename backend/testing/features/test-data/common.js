export const uniqueSeed = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

export const buildEmail = (prefix = 'feature') => `${prefix}+${uniqueSeed()}@example.com`

export const featurePasswords = Object.freeze({
  strong: 'Password123!',
  weak: 'BadPassword!',
  whitespace: '  '
})

export const featureNullObjectId = '000000000000000000000000'
