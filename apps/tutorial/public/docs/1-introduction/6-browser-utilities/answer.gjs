let data = {
  name: "Tatooine",
  gravity: "1 standard",
  terrain: "desert",
};

localStorage.setItem('localStorage-item', JSON.stringify(data));

let get = (key) => localStorage.getItem(key);

<template>
  From localStorage: <br>
  <pre>{{get "localStorage-item"}}</pre>

  Formatted: <br>
  <pre><code>{{JSON.stringify data null "  "}}</code></pre>
</template>
