Components, _unlike_ native HTML elements, but similar to WebComponents, can have multiple zones or regions for differently named block contents.

In the previous chapter, we learned that the default space between an opening and closing tag is the `:default` block.

Here, we may pass multiple blocks via `<:namedBlock>` notation,
```hbs
<MyComponent>
  <:header>some heading</:header>

  <:body>
    main content
  </:body>

  <:footer>footer content</:footer>
</MyComponent>
```

`<:namedBlock>` notation can be identified by the preceeding `:` character in both the opening and closing tag.

Inside `MyComponent`, we need to allow each of these blocks to be used via `{{yield to="blockName"}}`

```gjs
const MyComponent = <template>
  <header>{{yield to="header"}}</header>

  <main>
    {{yield to="body"}}
  </main>

  <footer>{{yield to="footer"}}</footer>
</template>;
```

<p class="call-to-play">Practice using named blocks within the playground area</p>.

Take note, there _are_ some constraints when it comes to invoking components with named blocks to help with conceptual consistency:
- _the order of named blocks regions does not matter._
  ```hbs
  <MyComponent>
    <:header>some heading</:header>
    <:body>body content here</:body>
  </MyComponent>
  ```
  is the same as 
  ```hbs
  <MyComponent>
    <:body>body content here</:body>
    <:header>some heading</:header>
  </MyComponent>
  ```
  This is because the placement of a block is determined by `<MyComponent>`, not the caller. This makes named blocks a good tool for design systems.
- _free-form content may not exist outside of named-blocked invocation._
  For example, this is invalid:
  ```hbs
  <MyComponent>
    content here 
    <:body>body content here</:body>
  </MyComponent>
  ```
  This is because, syntactically, content directly within the `<MyComponent>` and `</MyComponent>` belongs to the `:default` block, which is the same as defining
  ```hbs
  <MyComponent>
    <:default>
      content here
    </:default>
    <:body>body content here</:body>
  </MyComponent>
  ```
- _named blocks may not contain named blocks from the same parent component._
  for example, this is invaild
  ```gjs
  const Demo = <template>
    <MyComponent>
      <:body>
        body content here
        <:header>some heading</:header>
      </:body>
    </MyComponent>
  </template>
  ```
  This is invalid because the block content is **owned by the invoker*, so `<:header>` doesn't actually exist in the above component because there is no `{{yield to="header"}}` in `<Demo>`. You'll receive a build-time error similar to:
  ```
  Unexpected named block inside <:body> named block: 
    named blocks cannot contain nested named blocks: 
  ```
  _even_ if you try to defined `{{yield to="header"}}`
  ```gjs
  const Demo = <template>
    {{yield to="header"}}
    <MyComponent>
      <:body>
        body content here
        <:header>some heading</:header>
      </:body>
    </MyComponent>
  </template>
  ```
- _a component cannot pass content its own block._
  For example, trying to pass content to the `:header` named block:
  ```gjs
  const Demo = <template>
    {{yield to="header"}}
    <:header>some heading</:header>
  </template>
  ```
