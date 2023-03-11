# Portalling via `in-element`

```gjs live
const getBySelector = (selector) => document.querySelector(selector);

<template>
  portal: <div id="target"></div>


  <br><br>

  somewhere eles in your app

  {{#in-element (getBySelector '#target')}}
    hi, I could be a modal
  {{/in-element}}

  is content
</template>

```
