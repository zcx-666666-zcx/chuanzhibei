module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/__tests__/setup.js'],
  collectCoverageFrom: [
    'utils/**/*.js',
    'services/**/*.js'
  ],
  testMatch: ['**/__tests__/**/*.test.js']
}
