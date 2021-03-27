import { setComponentTemplate } from '@ember/component';
import templateOnlyComponent from '@ember/component/template-only';

import { compileTemplate } from './ember-to-opcodes';
// import { compileGJS } from './gjs-to-js';
import { parseMarkdown } from './markdown-to-ember';

import type { ExtractedCode } from './markdown-to-ember';
import type ApplicationInstance from '@ember/application/instance';
import type { TemplateFactory } from 'htmlbars-inline-precompile';

interface CompilationResult {
  rootTemplate?: string;
  rootTemplateFactory?: TemplateFactory;
  rootTemplateOpcodes?: string;

  error?: Error;
  errorLine?: number;
}

export async function compile(glimdownInput: string, name: string): Promise<CompilationResult> {
  let rootTemplate: string;
  let rootTemplateFactory: TemplateFactory;
  let liveCode: ExtractedCode[];

  /**
   * Step 1: Convert Markdown To HTML (Ember).
   *
   *         The remark plugin, remark-code-extra also extracts
   *         and transforms the code blocks we care about.
   *
   *         These blocks will be compiled through babel and eval'd so the
   *         compiled rootTemplate can invoke them
   */
  try {
    let { templateOnlyGlimdown, blocks } = await parseMarkdown(glimdownInput);

    rootTemplate = templateOnlyGlimdown;
    liveCode = blocks;
  } catch (error) {
    return { error };
  }

  /**
   * Step 2: Compile the live code samples
   */
  // eslint-disable-next-line no-console
  console.log('TODO', { liveCode });

  /**
   * Step 4: Compile the Ember Template
   */
  try {
    rootTemplateFactory = compileTemplate(rootTemplate, { moduleName: name });
  } catch (error) {
    return { error, rootTemplate };
  }

  // Temporarily, while we figure out how to load babel.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { rootTemplate, rootTemplateFactory, liveCode } as any;
}

export function opcodesFrom(owner: ApplicationInstance, templateFactory: TemplateFactory) {
  // The TemplateFactory has an incomplete type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (templateFactory as any)(owner).parsedLayout.block;
}

export function doesExist(owner: ApplicationInstance, id: string, existing?: string) {
  return id === existing && owner.hasRegistration(`component:${id}`);
}

export function register(owner: ApplicationInstance, template: TemplateFactory) {
  // __meta is probably private API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { moduleName } = (template as any).__meta;

  try {
    owner.register(
      `component:${moduleName}`,
      setComponentTemplate(template, templateOnlyComponent())
    );
  } catch (e) {
    if (e.message.includes('Cannot re-register')) {
      return;
    }

    throw e;
  }
}
