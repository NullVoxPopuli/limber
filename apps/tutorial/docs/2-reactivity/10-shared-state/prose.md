State can be shared between components without explicitly passing the state to each componeent.
This can is one way in which _[prop-drilling][prop-drilling]_ can be avoided.

In Ember/Glimmer, we lean on the native capabilities of browsers to manage state, and this often takes the form of a `class` for helpfully encapsulating related behaviors.

```js 
class Count {
  @tracked value;

  decrement = () => this.value--;
  increment = () => this.value++;
}

let count = new Count();
```

We can the use this `count` immediately in our components: 
```hbs 
<button {{on "click" count.increment}}>
  Increment (+)
</button>
```

In the provided example, implement `increment`, `decrement`, and `reset`.

In a real app, these components could all live in separate files and import the `count`.


[prop-drilling]: https://kentcdodds.com/blog/prop-drilling
