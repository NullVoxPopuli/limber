Making a select multiple field _controlled_ is nearly the same as making a non-multiple select field controlled -- the main difference is that we now need to deal with array data (manually).

Our value now represents an array of known options, rather than a single value, so our `isSelected` function must be updated:
```gjs
class Demo extends Component {
  // Note the `?.` because the initial value isn't set.
  isSelected = (value) => this.args.value?.includes(value);

  <template>
    <select multiple>
      <option value="red" selected={{this.isSelected "red"}}>Red</option>
      <option value="orange" selected={{this.isSelected "orange"}}>Orange</option>
      {{! ... }}
    </select>
  </template>
}
```

And for the event binding, we'll use the `change` event on the single select element. However, this time we need to do some processing to figure out what the selected array is.
```gjs
class Demo extends Component {
  handleChange = (event) => {
    let select = event.target;
    let selected = [...select.options]
      .filter(option => option.selected)
      .map(option => option.value);

    this.args.onChange(selected);
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


