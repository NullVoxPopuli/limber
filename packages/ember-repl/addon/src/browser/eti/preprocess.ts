// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getTemplateLocals } from '@glimmer/syntax';

import MagicString from 'magic-string';

import { expect } from './debug.ts';
import { parseTemplates } from './parse-templates.ts';

import type { ParseTemplatesOptions, TemplateMatch } from './parse-templates.ts';

interface PreprocessOptionsEager {
  importIdentifier?: string;
  importPath?: string;
  templateTag?: string;
  templateTagReplacement?: string;

  relativePath: string;
  includeSourceMaps: boolean;
  includeTemplateTokens: boolean;
}

interface PreprocessOptionsLazy {
  importIdentifier?: string;
  importPath?: string;
  templateTag?: string;
  templateTagReplacement?: string;

  relativePath: string;
  includeSourceMaps: boolean;
  includeTemplateTokens: boolean;
}

type PreprocessOptions = PreprocessOptionsLazy | PreprocessOptionsEager;

interface PreprocessedOutput {
  output: string;
  replacements: Replacement[];
}

interface Replacement {
  type: 'start' | 'end';
  index: number;
  oldLength: number;
  newLength: number;
  // originalLine: number;
  // originalCol: number;
}

function getMatchStartAndEnd(match: RegExpMatchArray) {
  return {
    start: expect(match.index, 'Expected regular expression match to have an index'),
    end:
      expect(match.index, 'Expected regular expression match to have an index') + match[0].length,
  };
}

function replacementFrom(
  template: string,
  index: number,
  oldLength: number,
  newLength: number,
  type: 'start' | 'end'
): Replacement {
  return {
    type,
    index,
    oldLength,
    newLength,
  };
}

function replaceMatch(
  s: MagicString,
  match: TemplateMatch,
  startReplacement: string,
  endReplacement: string,
  template: string,
  includeTemplateTokens: boolean
): Replacement[] {
  const { start: openStart, end: openEnd } = getMatchStartAndEnd(match.start);
  const { start: closeStart, end: closeEnd } = getMatchStartAndEnd(match.end);

  let options = '';

  if (includeTemplateTokens) {
    const tokensString = getTemplateLocals(template.slice(openEnd, closeStart))
      .filter((local: string) => local.match(/^[$A-Z_][0-9A-Z_$]*$/i))
      .join(',');

    if (tokensString.length > 0) {
      options = `, scope: () => ({${tokensString}})`;
    }
  }

  const newStart = `${startReplacement}\``;
  const newEnd = `\`, { strictMode: true${options} }${endReplacement}`;

  s.overwrite(openStart, openEnd, newStart);
  s.overwrite(closeStart, closeEnd, newEnd);
  ensureBackticksEscaped(s, openEnd + 1, closeStart - 1);

  return [
    replacementFrom(template, openStart, openEnd - openStart, newStart.length, 'start'),
    replacementFrom(template, closeStart, closeEnd - closeStart, newEnd.length, 'end'),
  ];
}

/**
 * Preprocesses all embedded templates within a JavaScript or TypeScript file.
 * This function replaces all embedded templates that match our template syntax
 * with valid, parseable JS. Optionally, it can also include a source map, and
 * it can also include all possible values used within the template.
 *
 * Input:
 *
 *   <template><MyComponent/><template>
 *
 * Output:
 *
 *   [GLIMMER_TEMPLATE(`<MyComponent/>`, { scope() { return {MyComponent}; } })];
 *
 * It can also be used with template literals to provide the in scope values:
 *
 * Input:
 *
 *   hbs`<MyComponent/>`;
 *
 * Output
 *
 *   hbs(`<MyComponent/>`, { scope() { return {MyComponent}; } });
 */
export function preprocessEmbeddedTemplates(
  template: string,
  options: PreprocessOptions
): PreprocessedOutput {
  const { templateTag, templateTagReplacement, includeTemplateTokens, relativePath } = options;

  const parseTemplatesOptions: ParseTemplatesOptions = {
    templateTag,
  };

  const matches = parseTemplates(template, relativePath, parseTemplatesOptions);
  const replacements: Replacement[] = [];
  const s = new MagicString(template);

  for (const match of matches) {
    if (match.type === 'template-tag') {
      replacements.push(
        ...replaceMatch(
          s,
          match,
          `[${templateTagReplacement}(`,
          ')]',
          template,
          includeTemplateTokens
        )
      );
    }
  }

  let output = s.toString();

  return {
    output,
    replacements,
  };
}

function ensureBackticksEscaped(s: MagicString, start: number, end: number) {
  if (start >= end) return;

  let content = s.slice(start, end);

  content = content.replace(/(?<!\\)`/g, '\\`');
  s.overwrite(start, end, content, false);
}
