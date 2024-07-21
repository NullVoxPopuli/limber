import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    browser: {
      provider: 'webdriverio',
      enabled: true,
      name: 'chrome',
    },
  },
});
