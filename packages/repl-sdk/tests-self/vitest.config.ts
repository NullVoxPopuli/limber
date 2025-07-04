import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
    },
    browser: {
      provider: 'webdriverio',
      // provider: 'playwright',
      enabled: true,
      instances: [
        // {
        //   browser: 'chromium',
        //   headless: true,
        // },
        {
          browser: 'chrome',
          headless: true,
        },
        {
          browser: 'firefox',
          headless: true,
        },
      ],
    },
  },
});
