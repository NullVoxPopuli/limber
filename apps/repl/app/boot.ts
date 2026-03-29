import environment from '#config';
import { cleanupSSRContent } from 'vite-ember-ssr/client';

import Application from './app.ts';

// Remove pre-rendered SSR content before Ember boots (no-op if not SSG'd)
cleanupSSRContent();

Application.create(environment.APP);
