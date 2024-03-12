`RemoteData` is a utility `Resource` from [ember-resources][gh-resources]
that provides an easy way to interact with [`fetch`][mdn-fetch]
with a pre-wired [`AbortController`][mdn-AbortController].

`RemoteData` has two supported uses,

- from a template

  ```hbs
  {{#let (RemoteData '...url...') as |request|}}
    isLoading:
    {{request.isLoading}}
    data:
    {{request.value}}
  {{/let}}
  ```

- or within a stateful component class

  ```gjs
  class Demo extends Component {
    @use request = RemoteData(() => `... url ... `);

    <template>
      isLoading: {{this.request.isLoading}}
      data: {{this.request.value}}
    </template>
  }
  ```

In this example, the fetching of data from the [StarWars API][swapi]
should occur automatically based on changes to the url passed to `RemoteData`.
You can change the `id` of the Person in the text field to fetch from the StarWars API.

Docs for `RemoteData` can [be found here][docs-remote-data].
Information about how Resources fit in to the next edition of Ember can be [found here][polaris-reactivity]

[gh-resources]: https://github.com/nullvoxpopuli/ember-resources
[mdn-fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
[mdn-AbortController]: https://developer.mozilla.org/en-US/docs/Web/API/AbortController
[docs-remote-data]: https://ember-resources.pages.dev/modules/util_remote_data
[polaris-reactivity]: https://wycats.github.io/polaris-sketchwork/reactivity.html
[swapi]: https://swapi.tech/
