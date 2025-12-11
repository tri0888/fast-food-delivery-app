const base = require('./jest.base.config.cjs')

module.exports = {
  ...base,
  displayName: 'api',
  testMatch: ['**/testing/api/**/*.test.js']
}
