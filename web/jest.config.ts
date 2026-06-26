import type { Config } from 'jest';

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
            react: { runtime: 'automatic' },
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
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src/components/ui/',
    'src/constants/',
    'src/components/layout/sidebar',
    'src/components/layout/header',
    'src/components/layout/footer',
    'src/components/layout/scroll-to-top',
    'src/lib/utils.ts',
  ],
};

export default config;
