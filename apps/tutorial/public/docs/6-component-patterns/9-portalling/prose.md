Portalling allows you to render content in a different location in the DOM than where it's declared in your component hierarchy. This is especially useful for modals, tooltips, and popovers that need to escape z-index constraints.

The `{{in-element}}` helper enables portalling:

```hbs
<div id="modal-root"></div>

{{#in-element (findTarget '#modal-root')}}
  This content renders in #modal-root
{{/in-element}}
```

**Common use cases:**
- **Modals and dialogs** - render at the document root to avoid z-index issues
- **Tooltips and popovers** - position relative to the viewport
- **Portal layouts** - render sidebar content in different DOM locations

Here's a practical modal example:

```gjs
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

const findTarget = (selector) => document.querySelector(selector);

export default class Demo extends Component {
  @tracked showModal = false;

  open = () => this.showModal = true;
  close = () => this.showModal = false;

  <template>
    <div id="modal-root"></div>

    <button {{on 'click' this.open}}>Open Modal</button>

    {{#if this.showModal}}
      {{#in-element (findTarget '#modal-root')}}
        <div class="modal">
          <p>Modal content here</p>
          <button {{on 'click' this.close}}>Close</button>
        </div>
      {{/in-element}}
    {{/if}}
  </template>
}
```

<p class="call-to-play">
  Try creating a portal that renders content in a target element when a button is clicked.
</p>

**Note:** The target element must exist in the DOM before the `{{in-element}}` helper runs. You can use modifiers or lifecycle hooks to ensure proper timing.

[Documentation][docs]

[docs]: https://api.emberjs.com/ember/release/classes/Ember.Templates.helpers/methods/in-element?anchor=in-element
