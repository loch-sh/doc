import path from 'node:path';
import {defineConfig, devices} from '@playwright/test';

/**
 * Screenshots of the Loch Panel interface for the docs, against the interface's
 * own mocked API (no server, no real data). `.interface` is a link to a
 * host-panel-interface checkout, created by scripts/screenshots.sh.
 */
const PORT = 4181;
// Absolute: `..` from the linked checkout would resolve outside this repository.
const dist = path.resolve(__dirname, '.dist');

export default defineConfig({
  testDir: '.',
  testMatch: 'capture.spec.ts',
  fullyParallel: true,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'], // first: it sets its own viewport
    baseURL: `http://localhost:${PORT}`,
    viewport: {width: 1440, height: 900},
    deviceScaleFactor: 1.25,
    timezoneId: 'Europe/Paris',
  },
  webServer: {
    cwd: '.interface',
    command: `npx vite build --outDir ${dist} --emptyOutDir && npx vite preview --outDir ${dist} --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 180_000,
    env: {
      VITE_API_URL: 'https://panel-api.example.com',
      VITE_WS_URL: 'wss://panel-api.example.com',
      VITE_APP_NAME: 'Loch.sh Panel',
    },
  },
});
