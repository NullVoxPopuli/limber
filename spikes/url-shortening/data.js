
import path from 'node:path';
import url from 'node:url';
import fs from 'node:fs/promises';

import { globby } from 'globby';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const SAMPLES_FOLDER = path.join(__dirname, '../../frontend/public/samples'); 

export async function getSamples() {
  let filePaths = await globby('**/*.md', { cwd: SAMPLES_FOLDER });

  let result = {};

  for (let filePath of filePaths) {
    let fileContent = await fs.readFile(path.join(SAMPLES_FOLDER, filePath), 'utf8');

    result[filePath] = fileContent.toString();
  }

  return result;
}

export const originalText = `
# Clock as a Resource

Resources can maintain encapsulated state and provide a reactive single value.

\`\`\`gjs live
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { resource, resourceFactory, cell } from 'ember-resources';
import { TrackedArray } from 'tracked-built-ins';

const dateFormat = new Intl.DateTimeFormat('default', {});
const defaultOptions = dateFormat.resolvedOptions();
const history = new TrackedArray();
class State {
  @tracked locale = 'en-US';

  us = () => this.locale = 'en-US';
  ko = () => this.locale = 'ko-KO';

  @tracked timeZone = 'America/Los_Angeles';
  tzSydney = () => this.timeZone = 'Australia/Sydney';
  tzLA = () => this.timeZone = 'America/Los_Angeles';
  tzHere = () => this.timeZone = defaultOptions.timeZone;

  toJSON = () => {
    let { locale, timeZone } = this;
    return { locale, timeZone };
  }
}
const state = new State();

async function log(item) {
  // we can't update tracked data while rendering
  await Promise.resolve();
  history.push(item);
  // updates could get really big, so let's constrain it to 10 items
  if (history.length > 10) history.shift();
}

const Clock = resourceFactory((locale) => {
  log('New locale received: ' + locale);

  return resource(({ on }) => {
    log('(re)invoking resource');
    let time = cell(new Date());
    let interval = setInterval(() => time.current = new Date(), 1000);

    on.cleanup(() => {
      log('Cleaning up');
      clearInterval(interval)
    });

    let formatter = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
      timeZone: state.timeZone,
    });

    return () => {
      log('Calculating value');
      return formatter.format(time.current);
    }
  });
});

const asList = (array) => array.join('\n');
const asJSON = (obj) => JSON.stringify(obj, null, 4);

<template>
  It is: <time>{{Clock state.locale}}</time>
  <hr>
  <div class="grid gap-2">
    <div>
      Change argument (locale):
      <button {{on 'click' state.us}}>US</button>
      <button {{on 'click' state.ko}}>Korea</button>
    </div>
    <div>
      Change tracked data (time zone):
      <button {{on 'click' state.tzSydney}}>Sydney</button>
      <button {{on 'click' state.tzLA}}>Los Angeles</button>
      <button {{on 'click' state.tzHere}}>Here</button>
    </div>
    <div>
      History & State:<br>
      <div class="flex flex-wrap gap-4">
        <pre>{{asList history}}</pre>
        <pre>{{asJSON state}}</pre>
      </div>
    </div>
  </div>
</template>

\`\`\`
`;




