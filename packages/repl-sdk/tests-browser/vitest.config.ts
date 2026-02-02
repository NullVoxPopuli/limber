import { webdriverio } from '@vitest/browser-webdriverio';
import { defineConfig } from 'vitest/config';
// import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
    },
    browser: {
      enabled: true,
      provider: webdriverio(),
      // provider: playwright(),
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
