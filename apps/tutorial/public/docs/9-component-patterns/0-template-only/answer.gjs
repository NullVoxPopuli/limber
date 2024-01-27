const Greeting = <template>
  <div class="layout">
    <img src={{@poster}}>

    <div class="info">
      <a href={{@imdb}} target="_blank">{{@name}}</a>

      <p>
        {{yield}}
      </p>
    </div>
  </div>

  <style>
    .layout {
      display: flex;
      gap: 1rem;

      img { margin: 0; }
    }
  </style>
</template>;

<template>
  <Greeting 
    @name="The Lord of the Rings: The Rings of Power" 
    @imdb="https://www.imdb.com/title/tt7631058/"
    @poster="https://m.media-amazon.com/images/M/MV5BNTg3NjcxYzgtYjljNC00Y2I2LWE3YmMtOTliZTkwYTE1MmZiXkEyXkFqcGdeQXVyNTY4NDc5MDE@._V1_QL75_UY281_CR18,0,190,281_.jpg"
  >

  Epic drama set thousands of years before the events of J.R.R. 
  Tolkien's 'The Hobbit' and 'The Lord of the Rings' follows an ensemble cast of characters, 
  both familiar and new, as they confront the long-feared re-emergence of evil to Middle-earth.
  </Greeting>
</template>
