export const securityEmails = {
  unique: (tag = 'sec') => `${tag}+${Date.now()}@security.test`
}

export const securityPasswords = {
  strong: 'Password123!',
  wrong: 'WrongPass123!'
}

export const sqlInjectionPayload = "' OR '1'='1"

export const forgedJwtHeader = { alg: 'none', typ: 'JWT' }

export const foodXssPayloads = {
  scriptTag: '<script>alert(1)</script>',
  imageOnError: '<img src=x onerror="alert(1)">' 
}

export const securityAddressTemplate = {
  firstName: 'Security',
  lastName: 'Suite',
  phone: '+84 900 000 000',
  city: 'Ho Chi Minh',
  state: 'District 1',
  zipcode: '700000',
  country: 'Vietnam'
}

export const securityOrderItems = {
  victimBase: (suffix = '') => ({
    _id: `food${suffix || '-victim'}`,
    name: suffix ? `Victim Meal ${suffix}` : 'Victim Meal',
    price: suffix ? 11 : 9,
    quantity: 1
  })
}

export const securityFoodAssets = {
  sampleImageBuffer: () => Buffer.from('security-food-image')
}
