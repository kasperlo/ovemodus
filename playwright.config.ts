import { defineConfig } from '@playwright/test';

// Testene kjører mot `vite preview` av siste build. Sett APP_URL for å teste noe annet,
// for eksempel prototypen: `npm run test:e2e:prototype`.
const PREVIEW_PORT = 4173;

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
  webServer: process.env.APP_URL
    ? undefined
    : {
        command: `npm run build && npx vite preview --port ${PREVIEW_PORT} --strictPort`,
        url: `http://localhost:${PREVIEW_PORT}/`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
