import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

// A class to represent a user profile
class User {
  @tracked profile = {
    name: 'John Doe',
    age: 30
  };
  
  @tracked address = {
    street: '123 Main St',
    city: 'Embertown',
    zipCode: '12345'
  };
  
  @tracked hobbies = ['reading', 'hiking', 'coding'];
  
  @action
  updateName(newName) {
    // TODO: This doesn't trigger reactivity! Fix it.
    this.profile.name = newName;
  }
  
  @action
  updateAddress(street, city, zipCode) {
    // TODO: Implement this method to update the address while maintaining reactivity
  }
  
  @action
  addHobby(hobby) {
    // TODO: Implement this method to add a hobby while maintaining reactivity
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
    </div>
    
    <style>
      .demo-container {
        padding: 1rem;
        max-width: 600px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
      
      .user-info, .user-address, .user-hobbies {
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
    </style>
  </template>
}

<template>
  <h2>Nested Reactivity</h2>
  <NestedReactivity />
</template>
