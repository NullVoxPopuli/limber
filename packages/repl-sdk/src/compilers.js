import * as ember from './compilers/ember.js';
import { js } from './compilers/js.js';
import * as markdown from './compilers/markdown.js';
import { mermaid } from './compilers/mermaid.js';
import * as react from './compilers/react.js';
import { qunit } from './compilers/qunit.js';
import { svelte } from './compilers/svelte.js';
import { vue } from './compilers/vue.js';

/**
 * @type {import('./types').Options['formats']}
 */
export const compilers = {
  hbs: {
    /**
     * ember has historically used a subset of HBS, and then built its own features on top of.
     *
     * It is not "handlebars", but does share a lot of similarities.
     * (and these continue in ember's new gjs and gts formats)
     *
     */
    ember: ember.hbs,
  },
  /**
   * Markdown, but every code fense can be a live "Island"
   * if `live` is in the codefence's meta tag and the compiler
   * is registered here, or by the user of repl-sdk.
   */
  md: markdown.md,

  /**
   * Glimmer-flavored Markdown.
   *
   * Like the markdow renderer, but the resulting HTML
   * is a Glimmer Component, rather than just plain HTML.
   *
   * https://emberjs.com
   * https://repl.nullvoxpopuli.com
   * https://kolay.nullvoxpopuli.com
   * https://tutorial.glimdown.com
   * https://limber.glimdown.com
   */
  gmd: ember.gmd,
  /**
   * Glimmer-Flavored JavaScript
   *
   * https://emberjs.com
   */
  gjs: ember.gjs,
  /**
   * TODO:
   * Glimmer-flavored TypeScript
   *
   * https://emberjs.com
   */
  // gts: ember.gts,

  /**
   * Just vanilla JS.
   */
  js,

  /**
   * JSX is too overloaded to treat one way.
   * We need to split this, and then make folks choose which one to use
   * - jsx-react
   * - jsx-vue
   * - jsx-solid
   * - (etc)
   *
   * This means that as a generic compiler, we can't just have jsx support.
   * And in markdown, we'll need to support choosing which flavor of jsx
   * via meta tags on the codefences.
   *
   * For example:
   * ```jsx solid
   * export default <></>;
   * ```
   *
   * or
   * ```jsx react
   * export default <></>;
   * ```
   */
  jsx: {
    /**
     * https://react.dev/
     */
    react: react.jsx,

    /**
     * TODO:
     * https://www.solidjs.com/
     */
    // solid: solid.jsx,
  },
  /**
   * https://mermaid.js.org/
   */
  mermaid,
  /**
   * https://qunitjs.com/
   */
  qunit,
  /**
   * https://svelte.dev/
   */
  svelte,
  /**
   * https://vuejs.org/
   */
  vue,
};
