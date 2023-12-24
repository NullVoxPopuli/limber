let Greeting = <template>
  Hello {{@name}}!<br>

  {{@response}}
</template>;

<template>

    <Greeting @name="there" @response="General Kenobi!" />

</template>
