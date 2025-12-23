import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

// Approach 1: Using tracked classes for nested objects
class Profile {
  @tracked name;
  @tracked age;
  
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}

class Address {
  @tracked street;
  @tracked city;
  @tracked zipCode;
  
  constructor(street, city, zipCode) {
    this.street = street;
    this.city = city;
    this.zipCode = zipCode;
  }
}

// A class to represent a user profile
class User {
  @tracked profile;
  @tracked address;
  @tracked hobbies;
  
  constructor() {
    this.profile = new Profile('John Doe', 30);
    this.address = new Address('123 Main St', 'Embertown', '12345');
    this.hobbies = ['reading', 'hiking', 'coding'];
  }
  
  @action
  updateName(newName) {
    // With tracked classes, we can directly update the property
    this.profile.name = newName;
  }
  
  @action
  updateAddress(street, city, zipCode) {
    // With tracked classes, we can directly update the properties
    this.address.street = street;
    this.address.city = city;
    this.address.zipCode = zipCode;
  }
  
  @action
  addHobby(hobby) {
    // For arrays, we need to create a new array to trigger reactivity
    this.hobbies = [...this.hobbies, hobby];
  }
}

class NestedReactivity extends Component {
  @tracked user = new User();
  @tracked newName = '';
  @tracked newStreet = '';
  @tracked newCity = '';
  @tracked newZipCode = '';
  @tracked newHobby = '';
  
  @action
  handleNameChange(event) {
    this.newName = event.target.value;
  }
  
  @action
  handleStreetChange(event) {
    this.newStreet = event.target.value;
  }
  
  @action
  handleCityChange(event) {
    this.newCity = event.target.value;
  }
  
  @action
  handleZipCodeChange(event) {
    this.newZipCode = event.target.value;
  }
  
  @action
  handleHobbyChange(event) {
    this.newHobby = event.target.value;
  }
  
  @action
  updateUserName() {
    if (this.newName) {
      this.user.updateName(this.newName);
      this.newName = '';
    }
  }
  
  @action
  updateUserAddress() {
    if (this.newStreet && this.newCity && this.newZipCode) {
      this.user.updateAddress(this.newStreet, this.newCity, this.newZipCode);
      this.newStreet = '';
      this.newCity = '';
      this.newZipCode = '';
    }
  }
  
  @action
  addUserHobby() {
    if (this.newHobby) {
      this.user.addHobby(this.newHobby);
      this.newHobby = '';
    }
  }

  <template>
    <div class="demo-container">
      <h3>Nested Reactivity Demo</h3>
      
      <div class="user-info">
        <h4>User Profile</h4>
        <p><strong>Name:</strong> {{this.user.profile.name}}</p>
        <p><strong>Age:</strong> {{this.user.profile.age}}</p>
        
        <div class="input-group">
          <input 
            type="text" 
            placeholder="New name" 
            value={{this.newName}} 
            {{on "input" this.handleNameChange}}
          />
          <button {{on "click" this.updateUserName}}>Update Name</button>
        </div>
      </div>
      
      <div class="user-address">
        <h4>User Address</h4>
        <p><strong>Street:</strong> {{this.user.address.street}}</p>
        <p><strong>City:</strong> {{this.user.address.city}}</p>
        <p><strong>Zip Code:</strong> {{this.user.address.zipCode}}</p>
        
        <div class="input-group">
          <input 
            type="text" 
            placeholder="New street" 
            value={{this.newStreet}} 
            {{on "input" this.handleStreetChange}}
          />
          <input 
            type="text" 
            placeholder="New city" 
            value={{this.newCity}} 
            {{on "input" this.handleCityChange}}
          />
          <input 
            type="text" 
            placeholder="New zip code" 
            value={{this.newZipCode}} 
            {{on "input" this.handleZipCodeChange}}
          />
          <button {{on "click" this.updateUserAddress}}>Update Address</button>
        </div>
      </div>
      
      <div class="user-hobbies">
        <h4>User Hobbies</h4>
        <ul>
          {{#each this.user.hobbies as |hobby|}}
            <li>{{hobby}}</li>
          {{/each}}
        </ul>
        
        <div class="input-group">
          <input 
            type="text" 
            placeholder="New hobby" 
            value={{this.newHobby}} 
            {{on "input" this.handleHobbyChange}}
          />
          <button {{on "click" this.addUserHobby}}>Add Hobby</button>
        </div>
      </div>
      
      <div class="alternative-approaches">
        <h4>Alternative Approaches</h4>
        
        <div class="approach">
          <h5>Approach 2: Replace the entire object</h5>
          <pre>
updateName(newName) {
  this.profile = { 
    ...this.profile, 
    name: newName 
  };
}
          </pre>
        </div>
        
        <div class="approach">
          <h5>Approach 3: Using tracked-built-ins</h5>
          <pre>
import { TrackedObject, TrackedArray } from 'tracked-built-ins';

class User {
  profile = new TrackedObject({ 
    name: 'John Doe', 
    age: 30 
  });
  
  hobbies = new TrackedArray([
    'reading', 'hiking', 'coding'
  ]);
  
  updateName(newName) {
    // Direct updates work with TrackedObject
    this.profile.name = newName;
  }
  
  addHobby(hobby) {
    // Direct mutations work with TrackedArray
    this.hobbies.push(hobby);
  }
}
          </pre>
        </div>
      </div>
    </div>
    
    <style>
      .demo-container {
        padding: 1rem;
        max-width: 600px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      .user-info, .user-address, .user-hobbies, .alternative-approaches {
        margin-bottom: 1.5rem;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      .input-group {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }
      
      input {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      button {
        padding: 0.5rem 1rem;
        background-color: #0078e7;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .approach {
        margin-bottom: 1rem;
      }
      
      pre {
        background-color: #f1f1f1;
        padding: 0.5rem;
        border-radius: 4px;
        overflow-x: auto;
      }
    </style>
  </template>
}

<template>
  <h2>Nested Reactivity</h2>
  <NestedReactivity />
</template>
