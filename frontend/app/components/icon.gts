const size = (size?: string) => size ? `fa-${size}` : 'fa-1';

<template>
  <svg
    class="fa {{size @size}}"
    fill="currentColor"
    width="24"
    height="24"
    xmlns="http://www.w3.org/2000/svg"
    ...attributes
  >
    <use href="/assets/svg/{{@name}}.svg#{{@name}}"></use>
  </svg>
</template>
