import Component from '@glimmer/component';
import { service } from '@ember/service';

import { Selection } from './selection';
import { Prose } from './prose';
import { Editor } from './editor';

import type DocsService from 'my-app/services/docs';

export default class Layout extends Component {
  <template>
    <main>
      <section>
        <Selection />
        <Prose />
      </section>
      <Editor />
    </main>
  </template>

  @service declare docs: DocsService;
}
