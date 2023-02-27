import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/setup.ts', 'src/worker.ts'],
  bundle: true,
  minify: true,
  outdir: 'dist',
  format: 'esm',
})
