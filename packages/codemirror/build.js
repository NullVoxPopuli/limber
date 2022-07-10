'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs').promises;
const copy = require('recursive-copy');
const esbuild = require('esbuild');

const OUTPUT_DIR = path.join(__dirname, 'dist').toString();

const isWatch = process.argv.includes('--watch');

if (isWatch) {
  console.info(`Starting watch mode...`);
}

module.exports = async function build() {
  let buildDir = await fs.mkdtemp(path.join(os.tmpdir(), 'monaco--workers-'));

  await esbuild.build({
    bundle: true,
    minify: false,
    sourcemap: false,
    format: 'esm',
    platform: 'browser',
    define: {
      'process.cwd': 'String',
    },
    loader: { '.ts': 'ts', '.js': 'js', '.ttf': 'file' },
    entryPoints: [path.join('preconfigured', 'index.ts')],
    outfile: path.join(buildDir, 'preconfigured.js'),
    // minification breaks codemirror somehow
    watch: isWatch
      ? {
          onRebuild(error, result) {
            if (error) console.error('watch build failed:', error);
            else console.log('watch build succeeded:', result);
          },
        }
      : false,
    // plugins: [replaceNodeBuiltins()]
  });

  await copy(`${buildDir}`, OUTPUT_DIR, {
    overwrite: true,
    filter: ['**/*'],
  });
};

if (require.main === module) {
  module.exports();
}

const replaceNodeBuiltins = () => {
  const replace = {
    // 'path': require.resolve('path-browserify'),
    // 'process': require.resolve('process'),
    // 'fs': require.resolve('./src/fs.cjs'),
    // 'util': require.resolve('./src/util.cjs'),
    // 'url': require.resolve('url/'),
  };
  const filter = RegExp(`^(${Object.keys(replace).join('|')})$`);

  return {
    name: 'replaceNodeBuiltIns',
    setup(build) {
      build.onResolve({ filter }, (arg) => ({
        path: replace[arg.path],
      }));
    },
  };
};
