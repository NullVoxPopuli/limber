import { compile, initial } from './demo.js';
import { register } from 'register-service-worker';

register('/sw.js', {
  registrationOptions: { scope: '/' },
  ready: () => compile(initial),
});
