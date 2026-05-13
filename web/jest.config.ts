import type {Config} from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/src/test/**/*.test.{ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          transform: {
            react: {runtime: 'automatic'},
            // Ось цей блок вирішує проблему з import.meta
            optimizer: {
              globals: {
                vars: {
                  'import.meta.env': 'process.env',
                },
              },
            },
          },
          parser: {
            syntax: 'typescript',
            tsx: true,
            // Дозволяємо динамічні імпорти, якщо вони є
            dynamicImport: true,
          },
        },
        module: {
          type: 'commonjs',
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