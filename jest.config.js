module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/tests/**/*.test.js', '<rootDir>/tests/**/*.spec.js'],
  collectCoverage: false,
  collectCoverageFrom: ['js/**/*.js', '!tests/**', '!node_modules/**'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/js/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
  transform: {},
  setupFilesAfterEnv: ['<rootDir>/tests/test-config.js'],
  moduleFileExtensions: ['js', 'json', 'html'],
  testTimeout: 10000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  restoreMocks: true,
};
