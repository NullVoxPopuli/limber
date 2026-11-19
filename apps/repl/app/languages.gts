import { assert } from '@ember/debug';

import { default as FileJavaScript } from '~icons/devicon/javascript?raw';
import { default as FileReact } from '~icons/devicon/react?raw';
import { default as FileSvelte } from '~icons/devicon/svelte?raw';
import { default as FileVue } from '~icons/devicon/vuejs?raw';
import { default as NestedMarkdown } from '~icons/mdi/language-markdown?raw';
import { default as FileEmber } from '~icons/vscode-icons/file-type-ember?raw';
import { default as FileGlimmer } from '~icons/vscode-icons/file-type-glimmer?raw';
import { default as FileHtml } from '~icons/vscode-icons/file-type-html?raw';
import { default as FileMarkdown } from '~icons/vscode-icons/file-type-markdown?raw';
import { default as FileMermaid } from '~icons/vscode-icons/file-type-mermaid?raw';
import { default as FileTypeScript } from '~icons/vscode-icons/file-type-typescript-official?raw';

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
 * The compiler stettings for all these are configured in routes/application/+route.ts
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
  gts: {
    name: 'Glimmer TS',
    ext: 'gts',
    icon: <template>
      <span style="position: relative;">
        <span>{{{FileGlimmer}}}</span>
        <span style="position: absolute; top: 0.3rem; left: 0.4rem;">{{{FileTypeScript}}}</span>
      </span>
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
    ext: 'svelte',
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
  html: {
    name: 'HTML',
    ext: 'html',
    icon: <template>
      <span>{{{FileHtml}}}</span>
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

export const ALLOWED_FORMATS = Object.keys(languages);

export type Format = (typeof ALLOWED_FORMATS)[number];

/**
 * The editor language of a format. `hbs` is short for `hbs|ember`.
 */
export function editorFormatOf(format: FormatQP): FormatQP;
export function editorFormatOf(format: string): string;

export function editorFormatOf(format: string) {
  return format === 'hbs' ? 'hbs|ember' : format;
}

/**
 * Extensions that no format here owns.
 * repl-sdk's editor has its own languages for css and json.
 */
const EXTENSION_FORMATS: Record<string, string> = {
  ts: 'gts',
  mjs: 'js',
  css: 'css',
  json: 'json',
};

/**
 * The editor language of a file, by its extension.
 * Undefined for a file that the editor shows as plain text.
 */
export function editorFormatFor(path: string): string | undefined {
  const dot = path.lastIndexOf('.');

  if (dot < 0) return;

  const ext = path.slice(dot + 1);
  const info = Object.values(LANGUAGE).find((language) => language.ext === ext);

  return info ? editorFormatOf(info.formatQP) : EXTENSION_FORMATS[ext];
}

export function infoFor(format: string) {
  const info = LANGUAGE[ALIASES[format] ?? format];

  assert(`Could not find info for ${format}`, info);

  return info;
}

export function isAllowedFormat(x?: string | null): x is (typeof ALLOWED_FORMATS)[number] {
  return Boolean(x && ALLOWED_FORMATS.includes(x));
}

export function formatQPFrom(x: string | undefined | null): FormatQP {
  assert(`Expected formatQP to be set`, x);

  const format = ALIASES[x] ?? x;

  assert(
    `Expected ${JSON.stringify(x)} to be one of ${ALLOWED_FORMATS.join(', ')}`,
    isAllowedFormat(format)
  );

  return format as FormatQP;
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
