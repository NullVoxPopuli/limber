# Nested Reactivity

Ember's reactivity system allows for tracking changes to properties and automatically updating the UI when those properties change. When working with nested data structures, understanding how reactivity works becomes even more important.

## Tracked Properties and Nested Objects

The `@tracked` decorator marks a property as reactive, but it only tracks changes to the property itself, not to nested properties within objects or arrays.

For example:

```js
class Person {
  @tracked profile = { name: 'John', age: 30 };
  
  updateName(newName) {
    // This won't trigger reactivity!
    this.profile.name = newName;
  }
  
  updateProfile(newProfile) {
    // This will trigger reactivity
    this.profile = newProfile;
  }
}
```

## Solutions for Nested Reactivity

There are several approaches to handle nested reactivity:

1. **Replace the entire object**: 
   ```js
   updateName(newName) {
     this.profile = { ...this.profile, name: newName };
   }
   ```

2. **Use tracked objects for nested properties**:
   ```js
   class Profile {
     @tracked name;
     @tracked age;
     
     constructor(name, age) {
       this.name = name;
       this.age = age;
     }
   }
   
   class Person {
     @tracked profile;
     
     constructor() {
       this.profile = new Profile('John', 30);
     }
     
     updateName(newName) {
       // This will trigger reactivity!
       this.profile.name = newName;
     }
   }
   ```

3. **Use tracked built-ins**:
   The `tracked-built-ins` package provides tracked versions of JavaScript's built-in data structures:
   ```js
   import { TrackedObject, TrackedArray } from 'tracked-built-ins';
   
   class Person {
     profile = new TrackedObject({ name: 'John', age: 30 });
     hobbies = new TrackedArray(['reading', 'hiking']);
     
     updateName(newName) {
       // This will trigger reactivity!
       this.profile.name = newName;
     }
     
     addHobby(hobby) {
       // This will trigger reactivity!
       this.hobbies.push(hobby);
     }
   }
   ```

<p class="call-to-play">
  Complete the <code>NestedReactivity</code> component by implementing proper nested reactivity:
  <ul>
    <li>Fix the user profile update to properly trigger reactivity</li>
    <li>Implement the address update function to maintain reactivity</li>
    <li>Create a method to add a new hobby that maintains reactivity</li>
  </ul>
</p>

[Documentation for tracked properties][tracked-properties]
[Documentation for tracked built-ins][tracked-built-ins]

[tracked-properties]: https://api.emberjs.com/ember/release/modules/@glimmer%2Ftracking
[tracked-built-ins]: https://github.com/tracked-tools/tracked-built-ins
