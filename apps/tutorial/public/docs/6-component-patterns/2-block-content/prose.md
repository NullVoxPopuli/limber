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

Try to create your own `:default` block-receiving component in the playground area.
