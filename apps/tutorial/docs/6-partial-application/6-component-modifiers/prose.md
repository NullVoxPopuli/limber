Currying modifiers is similar to currying attributes. There is no built in API for wiring up modifiers with the `(component)` helper, like there is for arguments.

To get around that limitation, we'll need to create an intermediate component that wires up the modifiers and forwards all relevant arguments.

For example, given we have a `<Button>` component,
```gjs
const Button = <template>
  <button ...attributes aria-disabled={{@isDisabled}}>{{yield}}</button>
</template>;
```

This could represent a button in a design system, but in a company product, you may want to intercept click events and provide analytics.
Normally, when we curry a component, we use `(component)` like this:

```gjs
const Demo = <template>
  {{yield (component Button isDisabled=@isDisabled)}}
</template>;
```

But to add a modifier to listen for click events, we need to create that aforementioned intermediate component, like the following
```gjs
function reportClick(event) {
  /* interact with some analytics service, amplitude, google, etc */
  console.log('tracking, not implemented or relevant here');
}

const CurriedButton = <template>
  <Button 
    ...attributes 
    {{on 'click' reportClick}}
    @isDisabled={{@isDisabled}}
  >
    {{yield}}
  </Button>
</template>;
```
and then update `<Demo>` to use this new `<CurriedButton>`
```gjs
const Demo = <template>
  {{yield (component CurriedButton isDisabled=@isDisabled}}
</template>;
```

