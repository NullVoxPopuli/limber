`unless` blocks behave the same as `if` blocks, except the condition is inverted.

For example:

```hbs
{{#unless condition}}
  shows when condition is false
{{else}}
  shows when condition is true
{{/unless}}
```

Try changing the `if` statement to an `unless` statement.
