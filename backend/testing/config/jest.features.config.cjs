const base = require('./jest.base.config.cjs')

module.exports = {
  ...base,
  displayName: 'features',
  testMatch: ['**/testing/features/**/*.test.js']
}
