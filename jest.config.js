module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.svelte$': ['svelte-jester', { preprocess: true }],
    '^.+\\.ts$': 'ts-jest'
  },
  moduleFileExtensions: ['js', 'ts', 'svelte'],
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      diagnostics: true
    }
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,ts,svelte}',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageReporters: ['html', 'text', 'text-summary', 'lcov'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: [
    '**/tests/**/*.+(ts|js|svelte)',
    '**/?(*.)+(spec|test).+(ts|js|svelte)'
  ],
  "jest": {
    "setupFiles": [
        "<rootDir>/setupTests.ts"
    ]
}
};

  