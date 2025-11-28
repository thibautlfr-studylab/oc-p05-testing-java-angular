const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  displayName: 'unit',
  testMatch: ['**/*.unit.spec.ts'],
  coverageDirectory: './coverage/jest/unit',
  collectCoverage: true,
};