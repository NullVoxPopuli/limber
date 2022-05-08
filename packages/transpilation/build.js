const path = require('path');
const esbuild = require('esbuild');

const entry = path.join(__dirname, 'src', 'index.ts');
const buildDir = path.join(__dirname, 'dist');

const isWatching = process.argv.includes('--watch')
const isProduction = !isWatching;

esbuild.build({
  loader: { '.ts': 'ts', '.js': 'js' },
  entryPoints: [entry],
  bundle: true,
  outfile: path.join(buildDir, `limber-worker.js`),
  format: 'esm',
  minify: isProduction,
  sourcemap: isProduction,
  ...(
    isWatching ? {
      incremental: true,
      watch: {
        onRebuild(error, result) {
          if (error) console.error('watch build failed:', error)
          else console.log('watch build succeeded:', result)
        },
      },
    }
      : {}
  )
});
