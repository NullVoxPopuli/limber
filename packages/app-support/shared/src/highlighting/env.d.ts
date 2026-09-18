/**
 * vite replaces this at build time. The apps that bundle this package build with vite.
 */
interface ImportMeta {
  env: { SSR: boolean };
}
