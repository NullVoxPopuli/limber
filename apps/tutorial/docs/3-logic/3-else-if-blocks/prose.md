Multiple conditions can be chained together without indentation or nesting.

```hbs
{{#if (moreThan10 x)}}
  <p>{{x}} is greater than 10</p>
{{else if (lessThan5)}}
  <p>{{x}} is less than 5</p>
{{else}}
  <p>{{x}} is between 5 and 10</p>
{{/if}}
```
