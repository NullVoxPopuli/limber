Components, like native HTML elements, may receive block content.

So far, you've seen component invocation like 
```hbs
<MyComponent />
```

This is a "blockless" or "void" invocation, meaning that no nested text or HTML is passed.

We can pass a block of content, by having a closing tag:
```hbs
<MyComponent></MyComponent>
```

This invocation still passes the a block (named `:default`), but it's empty.

To make the `:default` block more useful, we'll want to add some text or HTML
between the opening `<MyComponent>` tag and the closing `</MyComponent>` tag.

For example:
```hbs
<MyComponent>
  block<span>content</span> here.<br>

  This is also called the "default black".
</MyComponent>
```

All valid HTML is valid within a component or component block.

In order for `<MyComponent>` to be capable of receiving a block, we must place a `{{yield}}` within the component definition: 
```gjs
const MyComponent = <template>
  {{yield}}
</template>;
```

This `{{yield}}` is a shorthand for the longer, named version, `{{yield to="default"}}`, which we'll explore in the next chapter.

<p class="call-to-play">
  Try to create your own <code>:default</code> block-receiving component in the playground area.
</p>
