module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\.(js)$': 'babel-jest',
  },
  testMatch: ['**/server/**/*.test.js'],
};