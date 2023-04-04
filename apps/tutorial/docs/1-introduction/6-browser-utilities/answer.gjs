let data = {
  name: "Tatooine",
  gravity: "1 standard",
  terrain: "desert",
};

localStorage.setItem('localStorage-item', JSON.stringify(data));

// Pending update to GlimmerVM that does this automatically
let getItem = localStorage.getItem.bind(localStorage);

<template>
  From localStorage: <br>
  <pre>{{getItem "localStorage-item"}}</pre>

  Formatted: <br>
  <pre><code>{{JSON.stringify data null "\t"}}</code></pre>
</template>
