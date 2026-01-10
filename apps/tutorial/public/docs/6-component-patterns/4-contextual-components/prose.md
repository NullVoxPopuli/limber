Contextual components are components that are yielded from a parent component, providing a way to expose related components that share context or state.

This pattern uses the [`Object` constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/Object) to group multiple components together and yield them as a single object.

For example, imagine a `ButtonGroup` component that yields different button types:

```gjs
import { hash } from '@ember/helper';

const AcceptButton = <template>
  <button>Accept</button>
</template>;

const DeclineButton = <template>
  <button>Decline</button>
</template>;

const ButtonGroup = <template>
  {{yield (hash
    Accept=AcceptButton
    Decline=DeclineButton
  )}}
</template>;
```

Now when using `ButtonGroup`, you can access these contextual components:

```hbs
<ButtonGroup as |buttons|>
  <buttons.Accept />
  <buttons.Decline />
</ButtonGroup>
```

The components yielded this way can accept arguments, receive blocks, and everything else regular components can do:

```hbs
<ButtonGroup as |b|>
  <b.Accept />
  <b.Decline @text="to accept" />
</ButtonGroup>
```

<p class="call-to-play">
  In the editor, try adding another contextual component to <code>ButtonGroup</code> that accepts custom content via blocks.
</p>


This technique can be combined with _partial application_ to pre-wire up (reactive) data to private components so that consumers don't need to pass many arguments. See [this section of the tutorial to learn more](/6-partial-application/4-component).
