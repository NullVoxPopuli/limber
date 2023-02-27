import * as esbuild from 'esbuild';
import { execa } from 'execa';

await esbuild.build({
  entryPoints: ['src/setup.ts', 'src/worker.ts'],
  bundle: true,
  minify: true,
  outdir: 'dist',
  format: 'esm',
  sourcemap: true,
});

await execa('pnpm', ['tsc', '--noEmit', 'false']);
