Just like the controlled input, the _controlled radio button_ is roughly the same approach (conceptually), but we because we now have a list of options where only one can be active at a time, the way in which we set the "selected option" as well as how we handle the events will be very different.

Instead of setting value on a single input, we'll set `checked` to be the result of a function call on _each option_:
```gjs
class Demo extends Component {
  isChecked = (value) => this.args.value === value

  <template>
    <input
      type="radio" name="bestRace" value="zerg"
      {{! the string passed must match the value attribute }}
      checked={{this.isChecked "zerg"}}
    />
    <input
      type="radio" name="bestRace" value="protoss"
      checked={{this.isChecked "protoss"}}
    />
  </template>
}
```

And for the event binding, we'll use the `change` event on each of the radio inputs as well.
```gjs
class Demo extends Component {
  handleChange = (event) => {
    let radio = event.target;

    this.args.onChange(radio.value);
  }

  <template>
    <input
      type="radio" name="bestRace" value="zerg"
      {{on 'change' this.handleChange}}
    />
    <input
      type="radio" name="bestRace" value="protoss"
      {{on 'change' this.handleChange}}
    />
  </template>
}
```

<p class="call-to-play">
  Change the radio buttons within the <code>ControlledInput</code> component 
  to <strong>be controlled</strong>.
</p>


