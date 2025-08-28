// @ts-check
import { defineConfig } from "astro/config";
import ember from "ember-astro";

// https://astro.build/config
export default defineConfig({
  integrations: [ember()],
});
