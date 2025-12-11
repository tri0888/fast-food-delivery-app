const path = require('path')

module.exports = {
  rootDir: path.resolve(__dirname, '../..'),
  testEnvironment: 'node',
  testTimeout: 30000,
  transform: {},
  moduleFileExtensions: ['js', 'json'],
  extensionsToTreatAsEsm: ['.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js']
}
