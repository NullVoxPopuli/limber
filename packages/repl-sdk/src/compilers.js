import * as ember from './compilers/ember.js';
import * as markdown from './compilers/markdown.js';
import { mermaid } from './compilers/mermaid.js';
import * as react from './compilers/react.js';
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
  md: markdown.md,
  gjs: ember.gjs,
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
  },
  /**
   * https://mermaid.js.org/
   */
  mermaid,
  /**
   * https://svelte.dev/
   */
  svelte,
  /**
   * https://vuejs.org/
   */
  vue,
};
