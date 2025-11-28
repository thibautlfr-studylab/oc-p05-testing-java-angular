const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  displayName: 'integration',
  testMatch: ['**/*.integration.spec.ts'],
  coverageDirectory: './coverage/jest/integration',
  collectCoverage: true,
};