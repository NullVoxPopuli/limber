import Controller from '@ember/controller';

/**
 * See RFCs
 *  - https://github.com/emberjs/rfcs/pull/712/
 *  - https://github.com/emberjs/rfcs/pull/715/
 *
 *  After 715, this file may be deleted
 */
export default class ApplicationController extends Controller {
  queryParams = [
    // Code
    't', // legacy format, plaintext
    'c', // new format, uses lz-string for compressing text

    /**
     * Maximize / Minimize of the Editor
     *
     *   "min" | "max"
     *
     * Additionally this option can be used to set the editor size as a percent.
     * This should only be used in specific situations where you can
     *  guarantee the aspect ratio.
     *
     *  60v - vertical split, editor takes up 60% of the available space
     *  30h - horizontal split, editor takes up 30% of the available space
     *
     * The remainder of the space will be the output region.
     *
     * Omitting the 'v' or 'h' will be treated as if the option has not been passed at all.
     *
     * A value of 0 or 100 is not allowed use min/max for that.
     */
    'editor',

    // Normally the editor will load automatically upon detecting
    // activity -- this is to optimize page-load (as editors can be heavy
    // when fully featured)
    //
    // when this is 'true', the user will have to click a button to start editing.
    // This can be useful when limber is embedded for code samples on documentation sites
    // where the primary use case is reading, rather than tinkering.
    'noAutoEditor',

    // Normally the editor will load automatically upon detecting
    // activity -- this is to optimize page-load (as editors can be heavy
    // when fully featured)
    //
    // when this is 'true', the editor will automatically load, without
    // requiring user interaction.
    'forceEditor',

    // This is the file format to use for the editor.
    //
    // Supported
    //  - glimdown (default)
    //  - gjs
    //  - hbs
    //  - svelte
    //  - jsx|react
    //  - vue
    //  - mermaid
    'format',

    // Load a file from the public directory
    'file',

    // Force the output to be rendered in to a shadow-dom
    // or force it to not be rendered in to a shadow-dom if falsey value is passed
    'shadowdom',

    // Disable shiki highlighting on page load
    // this is primarily an optimization for tests
    'nohighlight',

    // For dev only. When present, will tell certain components to use localhost
    'local',
  ];
}
