Events can be conditional by combining `if` syntax in _modifier space_.

An important thing to keep in mind when writing conditional modifiers is the wrapping parenthesis:

```hbs
<button {{ (if condition (modifier on 'click' handleClick)) }}>
  Click me!
</button>
```
rather than 
```hbs
<button {{if condition (modifier on 'click' handleClick)}}>
  runtime error! 'if' is not a modifier
</button>
```


This exercise has set up two buttons: one to increment a value when clicked, and one to enable incrementing of that value.

<p class="call-to-play">
Adjust the code so that the toggle clicking button toggles the ability to increment the "Clicked" count.
</p>
