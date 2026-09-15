import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * vite-ember-ssr keys its CSS manifest by route name.
 * It derives the name from an `app/templates/<route>.gts` path
 * and falls back to the chunk name.
 *
 * Route templates live in `app/routes/<route>/+template.gts` here,
 * so every route chunk falls back to the same name, `_template`,
 * and the prerendered pages lose their stylesheet links.
 *
 * This rewrites the manifest with one entry per route
 * before the prerender step reads it.
 */
const routeTemplate = /\/app\/routes\/(.+)\/\+template\.gts$/;
const manifestFile = 'css-manifest.json';

export function routeCssManifest() {
  let base = '/';

  return {
    name: 'limber:route-css-manifest',
    configResolved(config) {
      base = config.base ?? '/';
    },
    async writeBundle(options, bundle) {
      const manifestPath = join(options.dir, manifestFile);
      let manifest;

      try {
        manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
      } catch {
        // Only the client build has a manifest
        return;
      }

      const chunks = new Map();
      const mainEntries = new Set();

      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue;

        chunks.set(output.fileName, output);

        if (output.isEntry && !output.isDynamicEntry) {
          mainEntries.add(output.fileName);
        }
      }

      // The main entry's CSS is already linked in the HTML template
      function collectCss(fileName, seen, css) {
        if (seen.has(fileName) || mainEntries.has(fileName)) return;

        seen.add(fileName);

        const chunk = chunks.get(fileName);

        if (!chunk) return;

        for (const cssFile of chunk.viteMetadata?.importedCss ?? []) {
          css.add(cssFile);
        }

        for (const imported of chunk.imports) {
          collectCss(imported, seen, css);
        }
      }

      for (const chunk of chunks.values()) {
        if (!chunk.isDynamicEntry || !chunk.facadeModuleId) continue;

        const match = routeTemplate.exec(chunk.facadeModuleId);

        if (!match) continue;

        delete manifest[chunk.name];

        const css = new Set();

        collectCss(chunk.fileName, new Set(), css);

        if (css.size > 0) {
          manifest[match[1].replaceAll('/', '.')] = Array.from(css, (file) => `${base}${file}`);
        }
      }

      await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    },
  };
}
