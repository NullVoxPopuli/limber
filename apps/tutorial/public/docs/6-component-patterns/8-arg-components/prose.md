Argument components are components passed down as arguments.

Here is an example of a `Greeter` component being passed down `Me` component as `@person` argument:

```gjs
const Me = <template>
  NullVoxPopuli
</template>;

const Greeter = <template>
  Hello <@person />!
</template>;

<template>
  <Greeter @person={{Me}} />
</template>
```
 
This pattern can be also used in cases where a component A `yields` component B and this one then needs to be used in component C:

```gjs
import { hash } from '@ember/helper';

const Button = <template>
  <button type="button">Close</button>
</template>;

const Sidebar = <template>
  <side>
    {{yield (hash closeButton=Button)}}
  </side>
</template>;

const Menu = <template>
  <nav>
    <ul>
      <li>Home</li>
      <li>About</li>
    </ul>
  </nav>

  <@closeMenu />
</template>;

<template>
  <Sidebar as |side|>
    <Menu @closeMenu={{side.closeButton}} />
  </Sidebar>
</template>;
```
