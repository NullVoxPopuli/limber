export default {
  plugins: ["prettier-plugin-ember-template-tag"],
  overrides: [
    {
      files: ["*.js", "*.ts", "*.cjs", ".mjs", ".cts", ".mts", ".cts"],
      options: {
        singleQuote: true,
        trailingComma: "es5",
      },
    },
  ],
};
