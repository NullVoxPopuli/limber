import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests-self/tests/**/*.test.ts"],
    includeSource: ["src/**/*.js"],
  },
});
