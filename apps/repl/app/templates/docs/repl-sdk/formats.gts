import * as gjs from './formats/gjs.gts';
import * as gmd from './formats/gmd.gts';
import * as hbs from './formats/hbs.gts';
import * as hbsEmber from './formats/hbs-ember.gts';
import * as js from './formats/js.gts';
import * as jsx from './formats/jsx.gts';
import * as jsxReact from './formats/jsx-react.gts';
import * as md from './formats/md.gts';
import * as mermaid from './formats/mermaid.gts';
import * as svelte from './formats/svelte.gts';
import * as vue from './formats/vue.gts';

import type { SimpleComponent } from '#types';

/**
 * This is meant to be alphabetical
 */
export const formats = [
  // One per line
  gjs,
  gmd,
  hbs,
  hbsEmber,
  js,
  jsx,
  jsxReact,
  md,
  mermaid,
  svelte,
  vue,
]
  .map((x) => Object.values(x))
  .flat() as SimpleComponent[];
