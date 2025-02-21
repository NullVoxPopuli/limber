import { configs } from "@nullvoxpopuli/eslint-configs";

const config = configs.ember(import.meta.dirname);

export default [
  ...config,
  {
    files: ["app/components/prose/prose-not-found.gts"],
    rules: {
      // https://github.com/NullVoxPopuli/ember-eslint-parser/pull/35
      "padding-line-between-statements": "off",
    },
  },
];
