import { configs } from "@nullvoxpopuli/eslint-configs";

export default [
  ...configs.ember(import.meta.dirname),
  {
    ignores: ["tests-ember", "tests-self"],
  },
];
