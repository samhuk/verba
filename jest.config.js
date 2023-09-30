module.exports = {
  testEnvironment: 'node',
  rootDir: './build/test-unit',
  transform: {
    '\\.[jt]sx?$': ['babel-jest', { configFile: './jest.babelrc' }],
  },
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text', 'cobertura'],
}
