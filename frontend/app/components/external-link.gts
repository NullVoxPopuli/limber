import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';

<template>
  <a
    target="_blank"
    rel="noreferrer noopener"
    href="#"
    class="flex gap-2 items-baseline focus:ring-4 focus:outline-none focus-visible:outline-none rounded-sm"
    ...attributes
  >
    <span>{{yield}}</span>

    <FaIcon @icon="external-link-alt" />
  </a>
</template>
