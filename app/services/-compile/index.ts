import { setComponentTemplate } from '@ember/component';
import templateOnlyComponent from '@ember/component/template-only';

import { compileTemplate } from './ember-to-opcodes';
import { compileGJS } from './gjs-to-js';
import { compileMarkdown } from './markdown-to-ember';

import type ApplicationInstance from '@ember/application/instance';
import type { TemplateFactory } from 'htmlbars-inline-precompile';

interface CompilationResult {
  rootTemplate?: string;
  rootTemplateFactory?: TemplateFactory;
  rootTemplateOpcodes?: string;

  error?: Error;
  errorLine?: number;
}

export function compile(glimdownInput: string, name: string): CompilationResult {
  let rootTemplate: string;
  let rootTemplateFactory: TemplateFactory;

  /**
   * Step 1: Extract live code blocks from the markdown.
   *         These will be compiled through babel and eval'd so the
   *         compiled rootTemplate can invoke them
   */

  /**
   * Step 2: Convert Markdown To HTML (Ember)
   */
  try {
    rootTemplate = compileMarkdown(glimdownInput);
  } catch (error) {
    return { error };
  }

  /**
   * Step 3: Compile the Ember Template
   */
  try {
    rootTemplateFactory = compileTemplate(rootTemplate, { moduleName: name });
  } catch (error) {
    return { error, rootTemplate };
  }

  return { rootTemplate, rootTemplateFactory };
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
