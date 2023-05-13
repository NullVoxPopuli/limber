const { watch } = require('@codemirror/buildhelper');
const { resolve } = require('path');

let args = process.argv.slice(2);

if (args.length != 1) {
  console.debug('Usage: cm-buildhelper src/mainfile.ts');
  process.exit(1);
}

watch([resolve(args[0])]);
