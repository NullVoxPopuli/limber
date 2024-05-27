An _uncontrolled_ input is what we've used so far, where the inputs themselves manage their own internal state. We do not control that state, and so they are _uncontrolled_.

A _controlled_ input is controlled by the invoking component. 

There are two parts to controlling a component: managing the value, and responding to an event on the input (which usually sets that managed value).


Managing the value is the same as we've seen before with setting an input's initial value:
```hbs
<input value={{@value}} />
```

The second part, responding to an event on the input, usually unwraps the event and passes the current value to the calling component:
```gjs
class Demo extends Component {
  handleInput = (event) => {
    this.args.onChange(event.target.value);
  }

  <template>
    <input value={{@value}} {{on 'input' this.handleInput}} />
  </template>
}
```

Because, with a text input, we expect a string to be passed to an `onChange` handler, we have nothing more to do. 

<p class="call-to-play">
  Change the input within the <code>ControlledInput</code> component 
  to <strong>be controlled</strong>.
</p>

