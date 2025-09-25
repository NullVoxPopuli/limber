import Header from './edit/header';

import type { TOC } from '@ember/component/template-only';

<template>
  <main class="grid-rows-editor grid h-screen max-h-screen grid-flow-col">
    <Header />

    <div class="error-content">
      <h1>ope!</h1>

      <p class="human-readable-error">
        {{#if @model.label}}
          <div class="error-label">
            {{@model.label}}
          </div>
        {{/if}}
        {{#if @model.intent}}
          I attempted to show you
          <br /><code>{{@model.intent}}</code>,<br />
          but it is not a valid path, so I can't help, sorry.

          <br />
          Perhaps, check if the URL is valid? I can't tell 🤔
        {{/if}}
      </p>

    </div>
  </main>

  <style>
    .error-content {
      padding: 40px;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      h1 {
        text-align: center;
        font-size: 4rem;
      }
      .human-readable-error {
        max-width: 80ch;
        text-align: center;
        position: relative;
        width: fit-content;
        margin: 0 auto;
        border: 1px solid lightgray;
        padding: 2rem;
        border-radius: 0.5rem;

        .error-label {
          position: absolute;
          top: -0.75rem;
          left: -0.125rem;
          font-size: 0.75rem;
          background: white;
          border: 1px solid lightgray;
          padding: 0.125rem 0.25rem;
        }

        code {
          border: 1px solid #efefef;
          background: #eee;
          padding: 0.125rem 0.25rem;
        }
      }
    }
  </style>
</template> satisfies TOC<{
  Args: {
    model: {
      intent: string;
      label: string;
    };
  };
}>;
