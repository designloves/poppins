const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  // index.html loads its own code as ES modules, which browsers refuse to
  // fetch over file:// (CORS blocks module imports from local files), so
  // tests need a real HTTP origin — a plain static file server is enough.
  webServer: {
    command: 'python3 -m http.server 4173',
    url: 'http://127.0.0.1:4173/index.html',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'ignore', // python's http.server logs each request here, not stdout
  },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    // Chromium only: the app's mobile bugs (keyboard-avoidance, viewport
    // sizing) all reproduce fine here, and this sandbox has no WebKit
    // engine available to run the "real" iPhone device preset against.
    browserName: 'chromium',
    viewport: { width: 393, height: 852 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
    trace: 'retain-on-failure',
  },
});
