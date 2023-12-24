let findTarget = (selector) => document.querySelector(selector);

<template>
  <div id="my-portal-target" style="border: 1px solid;"></div>

  <div style="background: #eee;">
    {{#in-element (findTarget '#my-portal-target')}}
      wrap this content in in-element
    {{/in-element}}
  </div>
</template>
