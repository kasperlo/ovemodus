import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // tests/e2e er Playwright og kjøres med `npm run test:e2e`.
    include: ['src/**/*.test.ts'],
  },
});
