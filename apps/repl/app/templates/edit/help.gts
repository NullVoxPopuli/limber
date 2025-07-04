import { on } from '@ember/modifier';

import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faQuestion, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Dialog as Modal } from 'ember-primitives/components/dialog';
import { notInIframe } from 'ember-primitives/iframe';

import { Button, ExternalLink, FAB, FlatButton } from 'limber-ui';

import type { TOC } from '@ember/component/template-only';

const Tutorial = <template>
  <ExternalLink class="m-0" href="https://tutorial.glimdown.com/">
    The Tutorial
  </ExternalLink>
</template>;

const IssueLink = <template>
  <ExternalLink href="https://github.com/NullVoxPopuli/limber/issues">
    issue here
  </ExternalLink>
</template>;

const MetadataTags = <template>
  <ul>
    <li>
      <code>live</code>
      -
      <em>renders in place</em>
    </li>
    <li>
      <code>live preview</code>
      -
      <em>renders in place, placing the source after the live render</em>
    </li>
    <li>
      <code>live preview below</code>
      -
      <em>renders in place, placing the live render below the source</em>
    </li>
  </ul>
</template>;

const SupportedLanguages = <template>
  <ul>
    <li>
      gjs /
      <code>&lt;template&gt;</code>
      - to learn more about this format, see
      <Tutorial />
    </li>
    <li>
      glimdown (glimmer + markdown) - this is the default and is great for writing documentation /
      demos / etc.
    </li>
    <li>
      hbs - just a template
    </li>
  </ul>
</template>;

const sample = '```{language} {...metadata}\n' + 'code\n' + '```';

const example = '```gjs live\n' + '<template>\n' + '  code\n' + '</template>\n' + '```';

const CodeBlock: TOC<{ Args: { code: string } }> = <template>
  <pre><code class="hljs language-markdown">{{@code}}</code></pre>
</template>;

export const Help = <template>
  {{#if (notInIframe)}}
    <Modal as |m|>
      <div class="fixed bottom-4 right-4">
        <FAB {{on "click" m.open}} aria-label="Help / How to use this tool">
          <FaIcon @size="xs" @icon={{faQuestion}} class="aspect-square" />
        </FAB>
      </div>

      <m.Dialog
        class="prose rounded border border-white drop-shadow-xl"
        aria-label="help with this tool"
      >
        <header class="flex items-center justify-between px-2 py-2">
          <h2 class="m-0">Help</h2>
          <FlatButton {{on "click" m.close}} aria-label="hide the help information">
            <FaIcon @size="xs" @icon={{faXmark}} class="aspect-square" />
          </FlatButton>
        </header>

        <hr class="mb-4 mt-4" />

        <main class="px-2">
          The editor has 3 modes
          <SupportedLanguages />

          When in markdown / glimdown mode, code fences can be used to live-render components via
          metadata tags as well as render the code snippet the live code comes from.

          <CodeBlock @code={{sample}} />

          <MetadataTags />

          The only language tags that are supported in markdown / glimdown are
          <code>hbs</code>
          and
          <code>gjs</code>
          with
          <code>gjs</code>
          being the most useful.

          <CodeBlock @code={{example}} />

          For any issues / questions, please file an
          <IssueLink />.
        </main>

        <footer class="flex justify-end px-2 py-2">
          <Button {{on "click" m.close}}>Close</Button>
        </footer>
      </m.Dialog>
    </Modal>
  {{/if}}
</template>;

export default Help;
