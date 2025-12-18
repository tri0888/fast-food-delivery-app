const base = require('./jest.base.config.cjs')

module.exports = {
  ...base,
  displayName: 'unit',
  testMatch: ['**/testing/unit/**/*.test.js']
}
