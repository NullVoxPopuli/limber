Portalling can be achieved via the `in-element` block-helper. 
This is useful for escaping z-index issues for pop-overs or in general rendering content in different places in the DOM.

```hbs 
<div id="my-portal-target"></div>

{{#in-element (findTarget '#my-portal-target')}}
  content here   
{{/in-element}}
```
