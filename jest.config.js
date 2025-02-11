module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './',
  roots: ['src'],
  transform: { '^.+.tsx?$': ['ts-jest'] },
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text', 'cobertura'],
}
