Event forwarding happens when a component exposes its _element-api_ via `...attributes`

```hbs 
<button ...attributes>
  Click me
</button>
```

Then the consumer of this component can add any event listener they wish:
 
```hbs 
<SomeComponent {{on 'click' handleClick}} />
```
