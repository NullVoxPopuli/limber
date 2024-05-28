Making the textarea element _controlled_ is similar to a text input. The only difference is where the value is set.

We can set the value by placing it in the content of the textarea element.
```gjs
class Demo extends Component {
  <template>
    <textarea>{{@value}}</textarea>
  </template>
}
```

And for the event binding, we can use the `input` event to have live updates as we type:
```gjs
class Demo extends Component {
  handleChange = (event) => {
    let textarea = event.target;

    this.args.onChange(textarea.value);
  }

  <template>
    <textarea {{on 'input' this.handleChange}}></textarea>
  </template>
}
```

<p class="call-to-play">
  Change the textarea within the <code>ControlledInput</code> component 
  to <strong>be controlled</strong>.
</p>


