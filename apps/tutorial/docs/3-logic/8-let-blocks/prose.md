`let` blocks allow defining an alias to other data.

```hbs
{{#let "hello there" as |greeting|}}
  {{greeting}}
{{/let}}
```

This is particularly useful when transformed data needs to be used in multiple places

```hbs 
{{#let (upper "hello there") as |greeting|}}
  {{greeting}}
{{/let}}
```

