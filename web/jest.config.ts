import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          transform: {
            react: { runtime: 'automatic' },
          },
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|svg|png|jpg|jpeg|gif|webp)$': 'identity-obj-proxy',
  },
};

export default config;
