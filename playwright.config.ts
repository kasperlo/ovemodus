import { defineConfig } from '@playwright/test';

// Testene kjører mot prototypen (prototype/ovemodus.html) som standard.
// Etter ombyggingen til Vite: sett APP_URL, eller legg inn webServer med `vite preview` her.
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  // Én worker: takt-testene måler timing og blir ustabile hvis flere nettlesere kjører samtidig.
  workers: 1,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    browserName: 'chromium',
    viewport: { width: 1366, height: 900 },
    launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] },
  },
});
