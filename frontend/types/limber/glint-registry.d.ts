import "@glint/environment-ember-loose";
import "@glint/environment-ember-loose/native-integration";
import "ember-page-title/glint";
import 'ember-statechart-component/glint';

import type { ComponentLike, HelperLike } from "@glint/template";

// declare module '@fortawesome/ember-fontawesome/components/fa-icon' {
//   export default ComponentLike;
// }

import type Output from 'limber/components/limber/output';
import type Portals from 'limber/components/limber/portals';
import type Header from 'limber/components/limber/header';
import type EditorContainer from 'limber/components/limber/editor-container';
import type Navigation from 'limber/components/limber/navigation';
import type Building from 'limber/components/limber/building';
import type Error from 'limber/components/limber/error';

import type service from 'limber/helpers/service';
import type not from 'limber/helpers/not';
import type inIframe from 'limber/helpers/in-iframe';
import type highlighted from 'limber/modifiers/highlighted';
import type positionedNLines from 'limber/modifiers/positioned-n-lines-from-top';
import type constraintVertically from "limber/modifiers/constrain-vertically";

declare module "@glint/environment-ember-loose/registry" {
  export default interface Registry {
    // How to define globals from external addons
    // state: HelperLike<{ Args: {}, Return: State }>;
    // attachShadow: ModifierLike<{ Args: { Positional: [State['update']]}}>;

    /**
     *  Components
     */
    'Limber::Output': typeof Output;
    'Limber::Portals': typeof Portals;
    'Limber::Header': typeof Header;
    'Limber::EditorContainer': typeof EditorContainer;
    'Limber::Navigation': typeof Navigation;
    'Limber::Building': typeof Building;
    'Limber::Error': typeof Error;
    'ContainerQuery': ComponentLike<{
      Element: HTMLDivElement;
      Args: {
        features: any;
      },
      Blocks: {
        default: [{ features: any }]
      }
    }>;

    /**
     * Helpers
     */
    service: typeof service;
    not: typeof not;
    'in-iframe': typeof inIframe;
    'cq-aspect-ratio': HelperLike<{
      Args: {
        Named: { min?: number, max?: number };
      }
    }>;

    /**
     * Modifiers
     */
    highlighted: typeof highlighted;
    'positioned-n-lines-from-top': typeof positionedNLines;
    'constrain-vertically': typeof constraintVertically;
  }
}
