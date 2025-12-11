const base = require('./jest.base.config.cjs')

module.exports = {
  ...base,
  displayName: 'data-integrity',
  testMatch: ['**/testing/data-integrity/**/*.test.js']
}
