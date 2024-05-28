Just like the controlled input, the _controlled select_ is roughly the same approach (conceptually), but we because we now have a list of options where only one can be active at a time, the way in which we set the "selected option" as well as how we handle the events will be very different.

Instead of setting value on a single input, we'll set `selected` to be the result of a function call on _each option_:
```gjs
class Demo extends Component {
  isSelected = (value) => this.args.value === value

  <template>
    <select>
      <option value="red" selected={{this.isSelected "red"}}>Red</option>
      <option value="orange" selected={{this.isSelected "orange"}}>Orange</option>
      {{! ... }}
    </select>
  </template>
}
```

And for the event binding, we'll use the `change` event on the single select element.
```gjs
class Demo extends Component {
  handleChange = (event) => {
    let select = event.target;

    this.args.onChange(select.value);
  }

  <template>
    <select {{on 'change' this.handleChange}}>
      {{! ... }}
    </select>
  </template>
}
```

<p class="call-to-play">
  Change the select within the <code>ControlledInput</code> component 
  to <strong>be controlled</strong>.
</p>


