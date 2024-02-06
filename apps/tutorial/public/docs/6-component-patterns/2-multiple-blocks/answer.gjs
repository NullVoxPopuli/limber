const MyComponent = <template>
  <div class='layout'>
    <header>
      {{yield to="header"}}
    </header>

    <main>
      {{yield to="body"}}
    </main>

    <footer>
      {{yield to="footer"}}
    </footer>
  </div>

  <style>
    .layout {
      display: grid;
      grid-template-rows: 40px 1fr 40px;
      gap: 0.5rem;
      /* accounting for default REPL padding */
      height: calc(100dvh - 3rem);

      header, main, footer {
        border: 1px solid;
        padding: 0.25rem;
      }
    }
  </style>
</template>;

<template>
  <MyComponent>
    <:header>
      header content here
    </:header>
    <:body>
      body content here
    </:body>
    <:footer>
      footer content there
    </:footer>
  </MyComponent>
</template>
