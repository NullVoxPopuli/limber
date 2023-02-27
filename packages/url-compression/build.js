import * as esbuild from 'esbuild';
import { execa } from 'execa';

await esbuild.build({
  entryPoints: ['src/setup.ts', 'src/worker.ts'],
  bundle: true,
  minify: true,
  outdir: 'dist',
  format: 'esm',
  sourcemap: true,
  target: ['chrome110', 'firefox110', 'safari16.3', 'edge110'],
});

await execa('pnpm', ['tsc', '--noEmit', 'false']);
