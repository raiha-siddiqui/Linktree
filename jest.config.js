export default {
  testEnvironment: 'node',
  testTimeout: 10000,
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
};