let planets = [
  { id: 1, name: 'Tatooine' },
  { id: 2, name: 'Alderaan' },
  { id: 3, name: 'Yavin IV' },
];

<template>
  <ul>
    {{#each planets as |planet|}}
      <li>
        <a href="https://swapi.tech/api/planets/{{planet.id}}/" target="_blank" rel="noopener noreferrer">
          {{planet.name}}
        </a>
      </li>
    {{/each}}
  </ul>
</template>
