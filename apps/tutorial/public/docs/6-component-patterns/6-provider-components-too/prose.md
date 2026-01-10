Provider components can also yield objects containing state and methods, making them easier to consume and more organized.

Instead of yielding multiple values separately:
```hbs
{{yield this.count this.increment this.decrement}}
```

We can yield a structured object using the [`Object` constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/Object):

```hbs
{{yield 
  (Object
    count=this.count
    increment=this.increment
    decrement=this.decrement
  )
}}
```

This can often make the consumer code more readable:

```hbs
<Counter as |counter|>
  <p>Count: {{counter.count}}</p>
  <button {{on 'click' counter.increment}}>+</button>
  <button {{on 'click' counter.decrement}}>-</button>
</Counter>
```

**Benefits of yielding objects:**
- Named access makes it clear what each value represents
- Order doesn't matter when destructuring
- Easier to add new properties without breaking existing consumers
- Self-documenting API

You can even combine this with contextual components:

```gjs
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

const Display = <template>
  Count: {{@count}}
</template>;

class Counter extends Component {
  @tracked count = 0;
  increment = () => this.count++;

  <template>
    {{yield 
      (Object
        count=this.count
        increment=this.increment
        Display=Display
      )
    }}
  </template>
}
```

<p class="call-to-play">
  Try converting the provider component from the previous chapter to yield a hash object instead of separate values.
</p>
