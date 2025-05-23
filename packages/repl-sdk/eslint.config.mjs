import { configs } from "@nullvoxpopuli/eslint-configs";

export default [
  ...configs.ember(import.meta.dirname),
  {
    ignores: ["tests-ember", "tests-self"],
  },
  {
    files: ["**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-call": "off",
    },
  },
];
