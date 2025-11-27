module.exports = {
  moduleNameMapper: {
    '@core/(.*)': '<rootDir>/src/app/core/$1',
  },
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['**/+(*.)+(int.spec).ts'],  // <-- ne pas inclure cypress/e2e  
  bail: false,
  verbose: false,
  collectCoverage: false,
  coverageDirectory: './coverage/jest/integration',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '/cypress/'],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/cypress/e2e/'  // <-- ignore tous les fichiers Cypress
  ],
  coverageThreshold: {
    global: {
      statements: 80
    },
  },
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
