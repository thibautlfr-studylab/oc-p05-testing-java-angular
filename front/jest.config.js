module.exports = {
  moduleNameMapper: {
    '@core/(.*)': '<rootDir>/src/app/core/$1',
  },
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  bail: false,
  verbose: false,
  collectCoverage: false,
  coverageDirectory: './coverage/jest',
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/'],

  // Configuration de couverture pour OpenClassrooms
  // Exigence: ≥80% sur TOUS les metrics (statements, branches, lines, functions)
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      lines: 80,
      functions: 80
    },
  },

  // Collecte de métriques de couverture complètes
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',           // Exclure tous les fichiers de test
    '!src/main.ts',                 // Exclure le point d'entrée
    '!src/environments/**',         // Exclure les environnements
    '!src/polyfills.ts',            // Exclure les polyfills
  ],

  roots: [
    "<rootDir>"
  ],
  modulePaths: [
    "<rootDir>"
  ],
  moduleDirectories: [
    "node_modules"
  ],
};
