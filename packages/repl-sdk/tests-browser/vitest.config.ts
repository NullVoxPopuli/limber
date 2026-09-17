import { webdriverio } from '@vitest/browser-webdriverio';
import { defineConfig } from 'vitest/config';
// import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  /**
   * The fs worker starts on the first compile and imports these.
   * Found during a test, vite optimizes them then and reloads the page,
   * which breaks whatever test was running.
   */
  optimizeDeps: {
    include: ['comlink', 'package-name-regex', 'tarparser'],
  },
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
