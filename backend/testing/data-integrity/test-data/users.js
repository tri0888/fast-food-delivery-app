export const dataIntegrityUserData = {
  buildUser: (overrides = {}) => ({
    name: 'Integrity User',
    email: `integrity+${Date.now()}@example.com`,
    password: 'Password123!',
    ...overrides
  })
}
