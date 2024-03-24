import { defineConfig } from 'vite';

export default defineConfig({
  // There are no good custom service worker building 
  // plugins...
  plugins: [
    {
      name: 'custom-service-worker',
      async closeBundle() {
        console.log('close bundle');
      }
    }
  ],
})
