import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  moduleNameMapper: {
    '^@wpn/shared-types$': '<rootDir>/../packages/shared-types/src/index.ts',
  },
  setupFiles: ['<rootDir>/src/tests/setup.ts'],
  clearMocks: true,
};

export default config;
