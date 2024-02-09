Conditional Blocks are `:named` blocks that only render when a condition is met. In many cases, that could be the condition that a block is used at all.

For example, observe the difference in these component invocations:
```hbs
<Modal>
  <:content>
     content here
  </:content>
</Modal>
```
and
```hbs
<Modal>
  <:content>
    quetsion here
  </:content>
  <:footer>
    buttons here
  </:footer>
</Modal>
```

The `:footer` block is optionally present, and we may expect that when it is omitted, that the component we're using, `Modal` in this case, doesn't include any of the padding or styling associated with the footer of the `Modal`.

To implement this, there is a built-in feature of the templating language, the [`(has-block)`][docs-has-block] helper.

Usage would look like this:
```hbs
{{#if (has-block 'footer')}}
  <footer class="styles, etc">
    {{yield to="footer"}}
  </footer>
{{/if}}
```

The styling provided by the `footer` element, and accompanying CSS classes would be omitted when the caller omits the `:footer` named block.

In this exercise, 
<p class="call-to-play">update the <code>Conditional</code> component to conditionally render the <code>:blue</code> block only when it is declared by the caller.</p>.



[docs-has-block]: https://api.emberjs.com/ember/5.6/classes/Ember.Templates.helpers/methods/has-block?anchor=has-block
