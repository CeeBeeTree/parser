module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js', '**/test/**/*.spec.js'],
  collectCoverageFrom: [
    'plugins/**/*.js',
    '!plugins/**/*.test.js',
    '!plugins/**/*.spec.js'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};
