module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
    '\\.ts$': 'ts-jest',
    '\\.js$': '<rootDir>/jest-transform-import-meta.js',
  },
};
