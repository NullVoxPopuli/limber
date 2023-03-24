Inline if can be useful for inline conditions:

- conditional argument values
- conditional css classes

```hbs
<Demo @background={{if darkMode "#222" "#eee"}} />

or

<div style="background: {{@background}}" class="{{if (isDarkMode @background) 'text-white' 'text-dark'}}">
```

Inline if is not a block-helper, so it does not need the `#` and `/` syntax.

It can be read similarly: `{{if (condition) (value when true) (value when false)}}`

Sometimes it can be hard to read the positional arguments of the inline if, so some folks will format like this:

```hbs
<div
  style="background: {{@background}}"
  class="{{if (isOnDark @background)
              'text-white'
              'text-dark'
         }}"
>
```
