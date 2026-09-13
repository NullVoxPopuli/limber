import { fileTests } from '@lezer/generator/dist/test';
import * as fs from 'fs';
import { before, describe, it } from 'mocha';
import * as path from 'path';

const cwd = process.cwd();

const distFiles = ['./dist/index.es.js', './dist/index.js'];
const caseDirs = ['test', 'tests'];

function firstExisting(candidates) {
  return candidates.find((candidate) => fs.existsSync(path.join(cwd, candidate)));
}

async function loadParser() {
  const module = await import(path.join(cwd, firstExisting(distFiles)));

  return module.parser || module.glimmerParser;
}

async function runTests() {
  const caseDir = path.join(cwd, firstExisting(caseDirs));

  for (const file of fs.readdirSync(caseDir)) {
    if (!/\.txt$/.test(file)) continue;

    const name = /^[^.]*/.exec(file)[0];

    describe(name, () => {
      let parser;

      before(async () => {
        parser = await loadParser();
      });

      const testFile = fs.readFileSync(path.join(caseDir, file), 'utf8');

      for (const { name, run } of fileTests(testFile, file)) it(name, () => run(parser));
    });
  }
}

runTests();
