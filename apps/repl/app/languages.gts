import { assert } from '@ember/debug';

import { default as FileJavaScript } from '~icons/devicon/javascript?raw';
import { default as FileReact } from '~icons/devicon/react?raw';
import { default as FileSvelte } from '~icons/devicon/svelte?raw';
import { default as FileVue } from '~icons/devicon/vuejs?raw';
import { default as NestedMarkdown } from '~icons/mdi/language-markdown?raw';
import { default as FileEmber } from '~icons/vscode-icons/file-type-ember?raw';
import { default as FileGlimmer } from '~icons/vscode-icons/file-type-glimmer?raw';
import { default as FileMarkdown } from '~icons/vscode-icons/file-type-markdown?raw';
import { default as FileMermaid } from '~icons/vscode-icons/file-type-mermaid?raw';

import type { ComponentLike } from '@glint/template';

type Language = (typeof LANGUAGE)[number];
/**
 * Since the pair of format + flavor is always coupled,
 * we're treating them as a single QP
 */
export type FormatQP = keyof typeof languages;

/**
 * This data is the source of truth, and is enriched afterwards
 *
 * { lang-key: lang-info }
 *
 * The compiler stettings for all these are configured in routes/application.ts
 */
const languages = {
  js: {
    name: 'Vanilla JS',
    ext: 'js',
    icon: <template>
      <span>{{{FileJavaScript}}}</span>
    </template>,
  },
  gjs: {
    name: 'Glimmer JS',
    ext: 'gjs',
    icon: <template>
      <span>{{{FileGlimmer}}}</span>
    </template>,
  },
  // an alias
  get hbs() {
    return languages['hbs|ember'];
  },
  ['hbs|ember']: {
    name: 'Ember Template',
    ext: 'hbs',
    icon: <template>
      <span>{{{FileEmber}}}</span>
    </template>,
  },
  vue: {
    name: 'Vue',
    ext: 'vue',
    icon: <template>
      <span>{{{FileVue}}}</span>
    </template>,
  },
  svelte: {
    name: 'Svelte',
    ext: 'sevlte',
    icon: <template>
      <span>{{{FileSvelte}}}</span>
    </template>,
  },
  'jsx|react': {
    name: 'JSX | React',
    ext: 'jsx',
    icon: <template>
      <span>{{{FileReact}}}</span>
    </template>,
  },
  mermaid: {
    name: 'Mermaid',
    ext: 'yaml',
    icon: <template>
      <span>{{{FileMermaid}}}</span>
    </template>,
  },
  md: {
    name: 'Markdown',
    ext: 'md',
    icon: <template>
      <span>{{{FileMarkdown}}}</span>
    </template>,
  },
  gmd: {
    name: 'Glimdown',
    ext: 'gmd',
    icon: <template>
      <span style="position: relative;">
        <span>{{{FileGlimmer}}}</span>
        <span style="position: absolute; top: 0.3rem; left: 0.4rem;">{{{NestedMarkdown}}}</span>
      </span>
    </template>,
  },
} as const;

const LANGUAGE = Object.entries(languages).reduce(
  /**
   * Add the key to each entry, which would make for easier iterating
   * in some cases
   */
  (result, [key, entry]) => {
    const data = {
      ...entry,
      key,
      formatQP: key,
    };

    result[key] = data;

    return result;
  },
  {} as Record<
    string,
    {
      name: string;
      /**
       * Filetype (usually)
       */
      ext: string;
      /**
       * Includes the flavor
       */
      formatQP: string;
      key: string;
      icon: ComponentLike<{ Element: null }>;
    }
  >
);

const ALIASES = {
  glimdown: 'gmd',
  gdm: 'gmd',
} as Record<string, string>;

export const DEFAULT_FORMAT = 'glimdown';

export const ALLOWED_FORMATS = Object.keys(languages);

export const ALLOWED_FLAVORS = {
  jsx: ['react'],
} as Record<string, string[]>;

export type Format = (typeof ALLOWED_FORMATS)[number];

function key(format: string, flavor: undefined | string) {
  const lang = flavor ? `${format}|${flavor}` : format;

  return lang;
}

export function infoFor(format: string, flavor?: undefined | string) {
  const lang = flavor ? `${format}|${flavor}` : format;

  let info = LANGUAGE[key(format, flavor)];

  // We have to do an alias check for all the prior former styles of formats
  if (!info && ALIASES[format]) {
    info = LANGUAGE[key(ALIASES[format], flavor)];
  }

  assert(`Could not find info for ${lang}${flavor ? ` and ${flavor}` : ''}`, info);

  return info;
}

export function iconFor(format: string, flavor: undefined | string) {
  return infoFor(format, flavor).icon;
}

export function nameFor(format: string, flavor: undefined | string) {
  return infoFor(format, flavor).name;
}

export function isAllowedFormat(x?: string | null): x is (typeof ALLOWED_FORMATS)[number] {
  return Boolean(x && ALLOWED_FORMATS.includes(x));
}

function isAllowedFlavor(format: string, flavor: string) {
  return (ALLOWED_FLAVORS[format] ?? []).includes(flavor);
}

export function flavorFrom(format: string | undefined | null, flavor?: string | null) {
  if (!format) return;
  if (!flavor) return;

  if (isAllowedFlavor(format, flavor)) {
    return flavor;
  }

  return;
}

export function formatQPFrom(x: string | undefined | null): FormatQP {
  // Historical Compat
  if (x === 'glimdown') return 'gmd';
  if (x === 'gdm') return 'gmd';

  assert(`Expected formatQP to be set`, x);
  assert(
    `Expected ${JSON.stringify(x)} to be one of ${Object.keys(languages).join(', ')}`,
    Object.keys(languages).includes(x)
  );

  return x as FormatQP;
}

export function formatFrom(x: string | undefined | null): FormatQP {
  if (isAllowedFormat(x)) {
    return x as FormatQP;
  }

  return 'gmd';
}

class Usage {
  #ownKey = `repl-language-usage`;

  track(formatQP: FormatQP) {
    const data = this.read();

    data[formatQP] ||= 0;
    data[formatQP]++;

    this.#set(data);
  }

  read(): Record<string, number> {
    const raw = localStorage.getItem(this.#ownKey);

    if (!raw) return {};

    try {
      const parsed = JSON.parse(raw);

      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed;
      }

      return {};
    } catch (e) {
      console.debug('Malformed usage data in localStorage');
      console.debug(e);

      return {};
    }
  }

  top2() {
    const data = this.read();
    const sorted = Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .map((a) => {
        return LANGUAGE[a[0]];
      }) as Language[];

    const top = sorted.slice(0, 2);

    const result = this.#withDefaultLangs(top);

    return result;
  }

  #withDefaultLangs(langs: Language[]): Language[] {
    const result = new Set([...langs, LANGUAGE.gjs!, LANGUAGE.gmd!]);

    return [...result.values()].slice(0, 2);
  }

  #set(data: Record<string, number>) {
    localStorage.setItem(this.#ownKey, JSON.stringify(data));
  }
}

export const usage = new Usage();
