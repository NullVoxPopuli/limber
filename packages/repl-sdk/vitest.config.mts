import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    includeSource: ["src/**/*.js"],
    exclude: ["tests-browser", "tests-ember", "node_modules/**"],
  },
});
