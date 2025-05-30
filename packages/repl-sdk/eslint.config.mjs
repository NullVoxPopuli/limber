import { configs } from "@nullvoxpopuli/eslint-configs";

export default [
  ...configs.ember(import.meta.dirname),
  {
    ignores: ["tests-ember", "tests-self"],
  },
  {
    rules: {
      // I'm indecisive right now!
      "no-unused-private-class-members": "off",
    },
  },
  {
    files: ["**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-call": "off",
    },
  },
  {
    files: ["src/compilers.js", "src/compilers/**"],
    rules: {
      "no-unused-vars": "off",
    },
  },
];
