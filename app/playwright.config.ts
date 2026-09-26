import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  webServer: {
    // --host 127.0.0.1 is required, not cosmetic: GitHub Actions'
    // ubuntu-latest runners can resolve the bare "localhost" vite preview
    // defaults to as ::1, while the url below always polls 127.0.0.1 —
    // without this the server binds somewhere the readiness probe never
    // checks and every run times out after 60s.
    command: 'npm run preview -- --port 4173 --host 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    viewport: { width: 393, height: 852 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
    trace: 'retain-on-failure',
  },
})
