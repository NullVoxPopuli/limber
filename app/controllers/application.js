import Controller from '@ember/controller';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {getOwner} from '@ember/application';
import {setComponentTemplate} from '@ember/component';
import templateOnlyComponent from "@ember/component/template-only";
import {guidFor} from '@ember/object/internals';
import {schedule, debounce} from '@ember/runloop';

import {compileTemplate as compile} from '@ember/template-compilation';

import unified from 'unified';
import markdown from 'remark-parse';
import html from 'remark-html';
import HBS from 'remark-hbs';

const markdownCompiler = unified().use(markdown).use(HBS).use(html);
const compileMarkdown = text => markdownCompiler.processSync(text).toString();

const DEFAULT_SNIPPET = `
# Limber Editor

_Ember rendered with markdown_

Similar to MDX!

## Template only content

List of links:

<ul>
  {{#each (array
    (hash href='https://emberjs.com' text='Ember home page')
    (hash href='https://github.com/nullvoxpopuli' text='My GitHub')
    (hash href='https://twitter.com/nullvoxpopuli' text='My Twitter')
  ) as |site|}}
    <li>
      <a href={{site.href}} target="_blank">{{site.text}}</a>
    </li>
  {{/each}}
</ul>

## With JavaScript

TBD (need to add babel to the browser bundle)

## TODOs

- dynamically load template, babel, and markdown compilers
- dynamically load code editor
`.trim()

export default class ApplicationController extends Controller {
  @tracked component = null;
  @tracked error = null;
  @tracked text = DEFAULT_SNIPPET;

  constructor() {
    super(...arguments);

    schedule('afterRender', () => this.makeComponent());
  }

  @action
  async makeComponent() {
    let id = `runtime-${guidFor(this.text)}`;
    let owner = getOwner(this);
    this.error = null;

    console.debug(`Compiling new component`);
    try {

      let readyForCompile = compileMarkdown(this.text);
      let template = compile(readyForCompile, {
        // https://github.com/emberjs/ember.js/blob/22bfcfdac0aeefcf333fb2d6697772934201b43b/packages/ember-template-compiler/lib/types.d.ts#L15
        // with strictMode, we'd need to import array, hash, and all that
        strictMode: false,
        locals: [],
        isProduction: false,
        moduleName: id,
        meta: {

        },
        plugins: {
          ast: []
        }
        // customizeComponentName(/* tag */){}
      });


      await Promise.resolve();

      owner.register(`component:${id}`, setComponentTemplate(template, templateOnlyComponent()));
    } catch (e) {
      this.error = e.message;
      return;
    }

    let previousId = this.component;
    this.component = id;

    owner.unregister(`component:${previousId}`);
  }

  @action
  updateText(e) {
    this.text = e.target.value;

    debounce(this, this.makeComponent, 300);
  }
}


