const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
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
