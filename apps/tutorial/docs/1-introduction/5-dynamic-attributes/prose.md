Similarly as data can be renderd within curly braces, curly braces can be used to control the values of element attributes.

Let's create an image with dynamic `src` and `alt` attributes. 

```hbs
<img src={{gifURL}}>
```

In a real dev environment, you'll be required to specify an `alt` description.
Without the `alt` description, users with slow or unstable internet connections, 
may not be able to download the image -- users who rely on screen readers won't be able to view the image either.  
Defining the `alt` description solves these problems.
More information about this requirement is described on [the linter docs][gh-etl-alt].

```hbs
<img src={{gifURL}} alt={{description}}>
```

[gh-etl-alt]: https://github.com/ember-template-lint/ember-template-lint/blob/b4433e9439f3c555b3c4beb56c34bfed18a423b5/docs/rule/require-valid-alt-text.md

