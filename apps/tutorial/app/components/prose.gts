import Component from '@glimmer/component';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import { trackedFunction } from 'ember-resources/util/function';
import { unified } from 'unified';

import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

import { highlight } from './/highlight';

import type RouterService from '@ember/routing/router-service';
import type DocsService from 'tutorial/services/docs';

const prosePath = (path: string): `${string}.md` => `/docs/${path}/prose.md`;

export class Prose extends Component {
  @service declare docs: DocsService;
  @service declare router: RouterService;

  showAnswer = () => this.router.transitionTo({ queryParams: { showAnswer: 1 }});
  hideAnswer = () => this.router.transitionTo({ queryParams: { showAnswer: 0 }});

  markdown = trackedFunction(this, async () => {
    let selected = this.docs.selected?.path;
    if (!selected) return;

    let response = await fetch(prosePath(selected));

    return response.text();
  });

  compiled = trackedFunction(this, async () => compile(this.markdown.value));

  <template>
    <div {{highlight this.compiled.value}}>
      {{#if this.compiled.value}}
        {{! template-lint-disable no-triple-curlies }}
        {{{this.compiled.value}}}
      {{/if}}
    </div>

    <footer>
      <button type="button" {{on "click" this.showAnswer}}>
        Show Answer
      </button>
      <button type="button" {{on "click" this.hideAnswer}}>
        Hide Answer
      </button>
    </footer>

  </template>
}

const compiler = unified().use(remarkParse).use(remarkRehype).use(rehypeStringify);

async function compile(markdown: string | undefined | null) {
  if (!markdown) return;

  let processed = await compiler.process(markdown);

  return String(processed);
}
