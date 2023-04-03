let planet = {
  name: 'Tatooine',
  rotationPeriod: 23,
  orbitalPeriod: 304,
  diameter: 10465,
  climate: 'arid',
  gravity: '1 standard',
  terrain: 'desert',
};

<template>
  <table>
    {{#each-in planet as |property value|}}
      <tr>
        <th scope="row">{{property}}</th>
        <td>{{value}}</td>
      </tr>
    {{/each-in}}
  </table>
</template>
