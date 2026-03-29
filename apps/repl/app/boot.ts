import environment from '#config';

import Application from './app.ts';

const app = Application.create({ ...environment.APP, autoboot: false });

app.visit(window.location.pathname + window.location.search, {
  _renderMode: 'rehydrate',
});
