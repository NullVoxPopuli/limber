import { fileTests } from '@lezer/generator/dist/test';
import * as fs from 'fs';
import { before, describe, it } from 'mocha';
import * as path from 'path';

let cwd = process.cwd();

async function runTests() {
  let caseDir = path.join(cwd, 'test');

  for (let file of fs.readdirSync(caseDir)) {
    if (!/\.txt$/.test(file)) continue;

    let name = /^[^.]*/.exec(file)[0];

    describe(name, () => {
      let parser;

      before(async () => {
        let module = await import(path.join(cwd, './dist/index.es.js'));

        parser = module.parser;
      });

      let testFile = fs.readFileSync(path.join(caseDir, file), 'utf8');

      for (let { name, run } of fileTests(testFile, file)) it(name, () => run(parser));
    });
  }
}

runTests();
