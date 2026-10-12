# Title

<Greeting @name="prose" />

```gjs live
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Demo extends Component {
  @tracked name = 'class';

  <template>
    <output class="one">{{this.name}}</output>
  </template>
}
```

```hbs live
<output class="two"><Greeting @name="hbs" /></output>
```

```gjs
const notLive = true;
```
