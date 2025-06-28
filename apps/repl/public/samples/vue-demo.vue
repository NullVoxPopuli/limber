<script setup>
  import { ref } from 'vue'

  const c = ref(0)
  const f = ref(32)

  function setC(e, v = +e.target.value) {
    c.value = v
    f.value = round(v * (9 / 5) + 32)
  }

  function setF(e, v = +e.target.value) {
    f.value = v
    c.value = round((v - 32) * (5 / 9))
  }

  function round(n) {
    return Math.round(n * 10) / 10;
  }
</script>

<template>
  <input type="number" :value="c" @change="setC"> Celsius =
  <input type="number" :value="f" @change="setF"> Fahrenheit
</template>
