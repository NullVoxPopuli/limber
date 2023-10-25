Currying attributes is useful when you want to pre-configure styles, classes, data, aria, or any other attributes. However, there is no built in API for wiring up attributes with the `(component)` helper, like there is for arguments.

To get around that limitation, we'll need to create an intermediate component that wires up the attributes and forwards all relevant arguments.

For example, given we have a `<Greeting>` component,
```gjs
const Greeting = <template>
  <div ...attributes>{{@greeting}}</div>
</template>;
```

And we want add a default `color` style to the text.
Normally, when we curry a component, we use `(component)` like this:

```gjs
const Demo = <template>
  {{yield (component Greeting greeting="hello there")}}
</template>;
```

But to add attributes, we need to create that aforementioned intermediate component, like the following
```gjs
const CurriedComponent = <template>
  <Greeting class="greeting" @greeting={{@greeting}} />
  <style>
    .greeting {
      color: red;
    }
  </style>
</template>;
```
and then update `<Demo>` to use this new `<CurriedComponent>`
```gjs
const Demo = <template>
  {{yield (component CurriedComponent greeting="hello there")}}
</template>;
```

