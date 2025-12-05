const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  testMatch: ['**/*.spec.ts'],
  testPathIgnorePatterns: [
    ...baseConfig.testPathIgnorePatterns || [],
    '.*\\.integration\\.spec\\.ts$'
  ],
  coverageDirectory: './coverage/unit',
  collectCoverage: true,
};
