const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testMatch: ['**/*.integration.spec.ts'],
  coverageDirectory: './coverage/integration',
  collectCoverage: true,
};
