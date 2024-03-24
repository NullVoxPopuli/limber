import { defineConfig } from 'vite';
import { execa } from 'execa';

export default defineConfig({
  // There are no good custom service worker building 
  // plugins...
  plugins: [
    {
      name: 'copy-sw',
      async buildStart() {
        execa('pnpm', ['ember-apply', 'init']);
      }
    }
  ],
})
