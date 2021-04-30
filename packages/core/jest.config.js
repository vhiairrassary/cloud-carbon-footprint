/*
 * © 2021 ThoughtWorks, Inc.
 */

module.exports = {
  roots: ['<rootDir>/src'],
  setupFiles: ['<rootDir>/test/setEnvVars.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 81,
      lines: 89,
      statements: 87,
    },
  },
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
}
