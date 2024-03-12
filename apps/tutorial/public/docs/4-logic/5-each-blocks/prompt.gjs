let planets = [
  { id: 1, name: 'Tatooine' },
  { id: 2, name: 'Alderaan' },
  { id: 3, name: 'Yavin IV' },
];

<template>
  <ul>
    {{! open each block }}
      <li>
        <a href="https://swapi.tech/api/planets/{{planet.id}}/" target="_blank" rel="noopener noreferrer">
          {{planet.name}}
        </a>
      </li>
    {{! close each block }}
  </ul>
</template>
