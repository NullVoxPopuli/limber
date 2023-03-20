Plain functions are inherently reactive.
Building off the previous example, call a function that transforms the greeting.

```hbs
 Greeting: {{(shout greeting.current)}}
```

Any time `greeting.current` changes, `shout` will be re-evaluated for you.
