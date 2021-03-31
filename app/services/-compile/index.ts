/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { setComponentTemplate } from '@ember/component';
import _templateOnlyComponent from '@ember/component/template-only';

import { compileTemplate } from './ember-to-opcodes';
import { parseMarkdown } from './markdown-to-ember';

import type { ExtractedCode } from './markdown-to-ember';
import type ApplicationInstance from '@ember/application/instance';
import type { TemplateOnlyComponent } from '@ember/component/template-only';
import type { TemplateFactory } from 'htmlbars-inline-precompile';

interface CompilationResult {
  rootTemplate?: string;
  rootTemplateFactory?: TemplateFactory;
  rootComponent?: object;
  scope?: object[];

  error?: Error;
  errorLine?: number;
}

export async function compile(glimdownInput: string, name: string): Promise<CompilationResult> {
  let rootTemplate: string;
  let rootTemplateFactory: TemplateFactory;
  let rootComponent: object;
  let liveCode: ExtractedCode[];
  let scope: object[] = [];

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
  if (liveCode.length > 0) {
    try {
      // let { compileGJS } = await import('limber/babel-compilation');

      // await Promise.all(liveCode.map(compileGJS));
      for (let { code, name, lang } of liveCode) {
        if (lang !== 'hbs') continue;

        scope.push(toComponent(compileTemplate(code, { moduleName: name }), name));
      }
    } catch (error) {
      console.error(error);

      return { error, rootTemplate };
    }
  }

  /**
   * Step 4: Compile the Ember Template
   */
  try {
    rootTemplateFactory = compileTemplate(rootTemplate, { moduleName: name });
    rootComponent = toComponent(rootTemplateFactory, name);
  } catch (error) {
    return { error, rootTemplate };
  }

  // Temporarily, while we figure out how to load babel.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { rootTemplate, rootTemplateFactory, rootComponent, liveCode, scope } as any;
}

function toComponent(template: TemplateFactory, name: string): TemplateOnlyComponent {
  // https://github.com/glimmerjs/glimmer-vm/blob/master/packages/%40glimmer/runtime/lib/component/template-only.ts#L83
  return setComponentTemplate(template, _templateOnlyComponent(name)) as TemplateOnlyComponent;
}

export function opcodesFrom(owner: ApplicationInstance, templateFactory: TemplateFactory) {
  // The TemplateFactory has an incomplete type
  return (templateFactory as any)(owner).parsedLayout.block;
}

export function doesExist(owner: ApplicationInstance, id: string, existing?: string) {
  return id === existing && owner.hasRegistration(`component:${id}`);
}

// type TemplateOnlyComponent does not have a moduleName property.. :-\
export function register(owner: ApplicationInstance, component: any) {
  try {
    owner.register(`component:${component.moduleName}`, component);
  } catch (e) {
    if (e.message.includes('Cannot re-register')) {
      return;
    }

    throw e;
  }
}
