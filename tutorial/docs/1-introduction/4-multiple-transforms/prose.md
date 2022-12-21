Functions can be chained together, just like in other languages

Define another function
```gjs
let name = "world";
let shout = (text) => text.toUpperCase(); 
let reverse = (text) => text.split('').reverse().join('');

<template>
  <h1>Hello {{ (shout name) }}</h1>
</template>
```

Then, we can chain the function:
```hbs
<h1>Hello {{ (reverse (shout name) )}}</h1>
```

Unlike JavaScript, Ember and Glimmer templates use [Polish Notation][polish] or 
_Prefix Notation_ which means that functions _precede_ their arguments.
This simple language allows templates to be transformed into lightweight JSON 
objects to save bytes during network transfer and time during the browser's 
parse and evaluation phases. For more information, see this [announcment video][secrets]

[polish]: https://en.wikipedia.org/wiki/Polish_notation
[secrets]: https://www.youtube.com/watch?v=nXCSloXZ-wc
