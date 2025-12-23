# Form Input Groups in Ember

Form input groups allow you to organize related form controls together, making forms more structured and easier to understand. This is particularly useful for complex forms with multiple sections or logical groupings of inputs.

## Working with Form Input Groups

When working with form input groups in Ember, it's important to understand:

1. HTML provides semantic elements like `fieldset` and `legend` for grouping related inputs
2. You can use CSS to visually separate and style different form groups
3. Form groups can help organize data collection and validation logic
4. When using FormData, inputs within groups are still accessed by their name attributes

## Semantic Form Grouping

HTML provides the `fieldset` and `legend` elements specifically for grouping related form controls:

```html
<fieldset>
  <legend>Personal Information</legend>
  <div class="form-group">
    <label for="firstName">First Name</label>
    <input type="text" id="firstName" name="firstName">
  </div>
  <div class="form-group">
    <label for="lastName">Last Name</label>
    <input type="text" id="lastName" name="lastName">
  </div>
</fieldset>
```

## Organizing Form Data

When working with grouped inputs, you can organize your data collection logic by group:

```js
@tracked personalInfo = {
  firstName: '',
  lastName: '',
  email: ''
};

@tracked addressInfo = {
  street: '',
  city: '',
  state: '',
  zip: ''
};

updatePersonalInfo = (event) => {
  const { name, value } = event.target;
  this.personalInfo = {
    ...this.personalInfo,
    [name]: value
  };
}

updateAddressInfo = (event) => {
  const { name, value } = event.target;
  this.addressInfo = {
    ...this.addressInfo,
    [name]: value
  };
}
```

## Using FormData with Grouped Inputs

When using FormData to collect form values, inputs within groups are still accessed by their name attributes:

```js
const handleSubmit = (event) => {
  let formData = new FormData(event.currentTarget);
  let data = Object.fromEntries(formData.entries());
  
  // You can then organize the flat data into groups if needed
  const personalInfo = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email
  };
  
  const addressInfo = {
    street: data.street,
    city: data.city,
    state: data.state,
    zip: data.zip
  };
  
  console.log({ personalInfo, addressInfo });
}
```

<p class="call-to-play">
  Complete the <code>FormGroupsDemo</code> component by:
  <ul>
    <li>Implementing a multi-section form with logical groupings of inputs</li>
    <li>Creating tracked objects to store data for each form group</li>
    <li>Adding update handlers that maintain the state of each group</li>
    <li>Implementing a form submission handler that organizes the data by group</li>
  </ul>
</p>

[Documentation for HTML fieldset element][mdn-fieldset]
[Documentation for FormData][mdn-formdata]
[Documentation for Object.fromEntries()][mdn-object-fromentries]

[mdn-fieldset]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset
[mdn-formdata]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[mdn-object-fromentries]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries
