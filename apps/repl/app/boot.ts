import environment from '#config';
import { cleanupSSRContent, installShoebox } from 'vite-ember-ssr/client';

import Application from './app.ts';

// Replay server-captured responses and clean up SSR markers (no-ops if not SSR'd)
installShoebox();
cleanupSSRContent();

Application.create(environment.APP);
