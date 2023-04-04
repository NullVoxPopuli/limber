# RemoteData

`RemoteData` is a utility `Resource` from [ember-resources][gh-resources]
that provides an easy way to interact with [`fetch`][mdn-fetch]
with a pre-wired [`AbortController`][mdn-AbortController].

In this example, the fetching of data from the [StarWars API][swapi] occurs
automatically based on changes to the URL.
You may change the `id` of the Person to fetch from the StarWars API.

```gjs live
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

import { use, resource } from 'ember-resources';
import { RemoteData, remoteData } from 'ember-resources/util/remote-data';
import { keepLatest } from 'ember-resources/util/keep-latest';

const isEmpty = (x) => !x || x?.length === 0;
const urlFor = (id) => `https://swapi.dev/api/people/${id}`;

const PersonInfo = <template>
  <fieldset class="border px-4">
    <legend>{{@person.url}}</legend>
    <pre><code class="language-json">{{JSON.stringify @person null "\t"}}</code></pre>
  </fieldset>

</template>;

export default class Demo extends Component {
  @tracked id = 51;
  updateId = (event) => this.id = event.target.value;

  @use request = RemoteData(() => urlFor(this.id));
  @use latest = keepLatest({ 
    value: () => this.request.value,
    when: () => this.request.isLoading,
  });

  <template>
    <div class="border p-4 grid gap-4">
      <label>
        Person ID
        <input
          type='number'
          class='border px-3 py-2'
          value={{this.id}}
          {{on 'input' this.updateId}}
        >
      </label>


      {{! We either have an initial value, or we don't }}
      {{#if this.latest}}

        {{! Async state for subsequent requests, only}}
        {{#if this.request.isPending}}
           ... loading ...
        {{else if this.request.isRejected}}
           error!
        {{/if}}
        
        <PersonInfo @person={{this.latest}} />
      {{else}}
        {{! This block only matters during the initial request }}
          
        {{#if this.rejest.isRejected}}
          error loading initial data!
        {{else}}
          <pre> ... loading ... </pre>
        {{/if}}
      {{/if}}
        
    </div>
  </template>
}
```

Docs for `RemoteData` can [be found here][docs-remote-data].
Information about how Resources fit in to the next edition of Ember can be [found here][polaris-reactivity]



[gh-resources]: https://github.com/nullvoxpopuli/ember-resources
[mdn-fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
[mdn-AbortController]: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
[docs-remote-data]: https://ember-resources.pages.dev/modules/util_remote_data
[polaris-reactivity]: https://wycats.github.io/polaris-sketchwork/reactivity.html
[swapi]: https://swapi.dev/
