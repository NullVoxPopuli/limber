Conceptually, the _controlled select_ takes roughly the same approach as the controlled input. But now we have a list of options where only one can be active at a time. That changes how we set the "selected option", and how we handle the events.

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


