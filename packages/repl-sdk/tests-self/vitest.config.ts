import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 30_000,
    browser: {
      provider: 'webdriverio',
      enabled: true,
      instances: [
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
