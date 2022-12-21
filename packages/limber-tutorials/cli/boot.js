#!/usr/bin/node
// @ts-check
import * as path from 'node:path';
import * as url from 'node:url';
import * as fs from 'fs/promises'; 

import findCacheDirectory from 'find-cache-dir';
import fse from 'fs-extra'
import { execa } from 'execa';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const cwd = process.cwd();

async function boot() {
  let docsDir = path.join(cwd, 'docs');
  let hasDocs = await fse.pathExists(docsDir);

  if (!hasDocs) {
    throw new Error(`docs directory not found! Please create a "docs" directory at ${cwd}`);
  }
    
  /**
    * bottled-ember doesn't yet take enough config.
    * so.. hax inbound
    *
    *
    * The process:
    * 1. create cache dir
    *   1. copy bottled-template to it
    *   2. copy docs directory at CWD to it
    * 2. cd to the tmp dir 
    * 3. run bottled-ember with very specifically crafted args
    */ 
    let cacheDir = findCacheDirectory({ name: 'limber-tutorials-staging', cwd });
    let templateDir = path.join(__dirname, '../bottled-template');

    if (!cacheDir) {
      throw new Error('Could not find a suitable location for cache.');
    }

    await fs.mkdir(cacheDir, { recursive: true });
    await fse.copy(templateDir, cacheDir, { recursive: true });
    await fse.copy(docsDir, path.join(cacheDir, 'docs'), { recursive: true });

    console.log({ cacheDir });

    // await execa('bottled-ember', [])
    await execa('node', [path.join(__dirname, 'bottled-ember.cjs')], { cwd: cacheDir, stdio: 'inherit' });
    
}


await boot();
