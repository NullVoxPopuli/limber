import { fileTests } from '@lezer/generator/dist/test';
import * as fs from 'fs';
import { before, describe, it } from 'mocha';
import * as path from 'path';

const cwd = process.cwd();

async function runTests() {
  const caseDir = path.join(cwd, 'test');

  for (const file of fs.readdirSync(caseDir)) {
    if (!/\.txt$/.test(file)) continue;

    const name = /^[^.]*/.exec(file)[0];

    describe(name, () => {
      let parser;

      before(async () => {
        const module = await import(path.join(cwd, './dist/index.es.js'));

        parser = module.parser;
      });

      const testFile = fs.readFileSync(path.join(caseDir, file), 'utf8');

      for (const { name, run } of fileTests(testFile, file)) it(name, () => run(parser));
    });
  }
}

runTests();
