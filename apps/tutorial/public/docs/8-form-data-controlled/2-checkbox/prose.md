Just like the controlled input, the _controlled checkbox_ is roughly the same approach, but with a different property and event binding combination. 

Instead of setting value, we'll set `checked`.
```hbs
<input type="checkbox" checked={{@value}} />
```

And for the event binding, we'll use the `change` event.
```gjs
class Demo extends Component {
  handleChange = (event) => {
    let value = Boolean(event.target.checked);
    this.args.onChange(value);
  }

  <template>
    <input 
      type="checkbox" 
      value={{@value}} 
      {{on 'change' this.handleChange}} />
  </template>
}
```

Checkboxes have a default `value` of `on` (as a string), which may not be a desired value to pass to your `onChange` handler. In this example, we can convert the `checked` property to a boolean.

<p class="call-to-play">
  Change the checkbox within the <code>ControlledInput</code> component 
  to <strong>be controlled</strong>.
</p>


### References

- [Checkbox Inputs at MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox)

API Docs:
- [let](https://api.emberjs.com/ember/5.8/classes/Ember.Templates.helpers/methods/let?anchor=let)
- [on](https://api.emberjs.com/ember/5.8/classes/Ember.Templates.helpers/methods/on?anchor=on)
- [Component](https://api.emberjs.com/ember/5.8/modules/@glimmer%2Fcomponent)
- [tracked](https://api.emberjs.com/ember/5.8/functions/@glimmer%2Ftracking/tracked)
