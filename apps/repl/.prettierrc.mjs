export default {
  plugins: [
    "prettier-plugin-ember-template-tag",
    "prettier-plugin-tailwindcss",
  ],
  tailwindStylesheet: "./app/styles/app.css",
  overrides: [
    {
      files: ["*.js", "*.ts", "*.cjs", "*.mjs", "*.cts", "*.mts", "*.cts"],
      options: {
        singleQuote: true,
        trailingComma: "es5",
      },
    },
    {
      files: ["*.gjs", "*.gts"],
      options: {
        singleQuote: true,
        templateSingleQuote: false,
        trailingComma: "es5",
      },
    },
  ],
};
