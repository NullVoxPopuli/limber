// Renders: 🐹 + 🧑‍💻 = 🧡


const Hamster = <template>
  🐹
</template>;

const Computer = <template>
  🧑‍💻
</template>;

const BlueHeart = <template>💙</template>;
const GreenHeart = <template>💚</template>;
const OrangeHeart = <template>🧡</template>;

const Love = <template>
  {{yield
    (hash
      blue=BlueHeart
      green=GreenHeart
      orange=OrangeHeart
    )
  }}
</template>;

const Ember = <template>
  <@hamster /> + <@computer /> = <@love />
</template>;

<template>
  <Ember />
</template>
