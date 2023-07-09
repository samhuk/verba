module.exports = {
  testEnvironment: 'node',
  rootDir: './build-test',
  transform: {
    '\\.[jt]sx?$': ['babel-jest', { configFile: './jest.babelrc' }],
  },
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text', 'cobertura'],
}
