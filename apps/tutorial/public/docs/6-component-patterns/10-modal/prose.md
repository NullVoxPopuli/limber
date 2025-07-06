# Creating a Modal Component

Modal dialogs are a common UI pattern that display content in a layer above the page, typically with a semi-transparent backdrop that prevents interaction with the page underneath.

Building a modal in Ember/Glimmer involves several key concepts:
1. **Portalling** - Using `in-element` to render the modal outside of the normal DOM flow
2. **Conditional rendering** - Showing/hiding the modal based on state
3. **Event handling** - Closing the modal when clicking outside or pressing escape
4. **Accessibility** - Ensuring the modal is accessible to all users

For this tutorial, we'll focus on creating a basic modal component that uses portalling to render outside the normal DOM flow and includes a backdrop that closes the modal when clicked.

<p class="call-to-play">
  Complete the <code>Modal</code> component by:
  <ul>
    <li>Using <code>in-element</code> to render the modal content in the modal-container</li>
    <li>Adding an event handler to close the modal when the backdrop is clicked</li>
  </ul>
</p>

[Documentation for in-element][docs-in-element]
[Documentation for on modifier][docs-on]

[docs-in-element]: https://api.emberjs.com/ember/release/classes/Ember.Templates.helpers/methods/in-element?anchor=in-element
[docs-on]: https://api.emberjs.com/ember/release/classes/Ember.Templates.helpers/methods/on?anchor=on
