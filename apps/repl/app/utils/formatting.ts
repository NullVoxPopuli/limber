import type { FormatQP } from '#app/languages.gts';
import type * as Prettier from 'prettier';

/**
 * Prettier and its plugins load from esm.sh on first use,
 * so they never enter the app bundle.
 *
 * The versions are pinned here, not in package.json,
 * because the running app does not use the installed copies.
 */
const PRETTIER_VERSION = '3.9.6';
const EMBER_TEMPLATE_TAG_VERSION = '2.1.8';

type Standalone = Pick<typeof Prettier, 'format'>;
type Plugin = Prettier.Plugin;
type PluginName = keyof typeof PLUGIN_URLS;

const STANDALONE_URL = `https://esm.sh/prettier@${PRETTIER_VERSION}/standalone`;

const PLUGIN_URLS = {
  babel: `https://esm.sh/prettier@${PRETTIER_VERSION}/plugins/babel`,
  estree: `https://esm.sh/prettier@${PRETTIER_VERSION}/plugins/estree`,
  glimmer: `https://esm.sh/prettier@${PRETTIER_VERSION}/plugins/glimmer`,
  markdown: `https://esm.sh/prettier@${PRETTIER_VERSION}/plugins/markdown`,
  html: `https://esm.sh/prettier@${PRETTIER_VERSION}/plugins/html`,
  postcss: `https://esm.sh/prettier@${PRETTIER_VERSION}/plugins/postcss`,
  /**
   * `deps` pins the plugin's prettier peer to the same version as standalone.
   * Without it, esm.sh resolves `prettier@>=3.0.0` to a second prettier copy.
   */
  'ember-template-tag': `https://esm.sh/prettier-plugin-ember-template-tag@${EMBER_TEMPLATE_TAG_VERSION}?deps=prettier@${PRETTIER_VERSION}`,
} as const;

/**
 * The ember plugin does not import its own copies of babel and estree,
 * so every format that uses it lists them too.
 *
 * gmd gets the code plugins so that fenced gjs, gts, and hbs blocks
 * are formatted along with the markdown.
 */
const FORMATTERS: Record<FormatQP, { parser: string; plugins: PluginName[] } | undefined> = {
  js: { parser: 'babel', plugins: ['babel', 'estree'] },
  'jsx|react': { parser: 'babel', plugins: ['babel', 'estree'] },
  gjs: {
    parser: 'ember-template-tag',
    plugins: ['babel', 'estree', 'glimmer', 'ember-template-tag'],
  },
  gts: {
    parser: 'ember-template-tag',
    plugins: ['babel', 'estree', 'glimmer', 'ember-template-tag'],
  },
  hbs: { parser: 'glimmer', plugins: ['glimmer'] },
  'hbs|ember': { parser: 'glimmer', plugins: ['glimmer'] },
  md: { parser: 'markdown', plugins: ['markdown'] },
  gmd: {
    parser: 'markdown',
    plugins: ['markdown', 'babel', 'estree', 'glimmer', 'ember-template-tag'],
  },
  vue: { parser: 'vue', plugins: ['html', 'babel', 'estree', 'postcss'] },
  svelte: undefined,
  mermaid: undefined,
};

const modules = new Map<string, Promise<unknown>>();

function load(url: string): Promise<unknown> {
  let existing = modules.get(url);

  if (!existing) {
    existing = import(/* @vite-ignore */ url);
    modules.set(url, existing);
  }

  return existing;
}

/**
 * esm.sh converts the CJS ember plugin to ESM with a default export.
 * Prettier's own plugins are ESM and export their parts at the top level.
 */
function asPlugin(module: unknown): Plugin {
  if (module && typeof module === 'object' && 'default' in module && module.default) {
    return module.default as Plugin;
  }

  return module as Plugin;
}

export function canFormat(format: FormatQP): boolean {
  return Boolean(FORMATTERS[format]);
}

export async function formatDocument(format: FormatQP, text: string): Promise<string> {
  const config = FORMATTERS[format];

  if (!config) {
    throw new Error(`There is no formatter for ${format}`);
  }

  const standalone = load(STANDALONE_URL) as Promise<Standalone>;
  const plugins = Promise.all(config.plugins.map((name) => load(PLUGIN_URLS[name]).then(asPlugin)));

  return (await standalone).format(text, { parser: config.parser, plugins: await plugins });
}
