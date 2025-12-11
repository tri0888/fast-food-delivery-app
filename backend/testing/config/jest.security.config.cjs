const base = require('./jest.base.config.cjs')

module.exports = {
  ...base,
  displayName: 'security',
  testMatch: ['**/testing/security/**/*.test.js']
}
