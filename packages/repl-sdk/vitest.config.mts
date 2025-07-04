import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    includeSource: ["src/**/*.js"],
    exclude: ["tests-self", "tests-ember", "node_modules"],
  },
});
