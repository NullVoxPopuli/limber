import '@glint/environment-ember-loose';
import '@glint/environment-ember-loose/native-integration';
import 'ember-page-title/glint';
import 'ember-statechart-component/glint';

import type EmberContainerQueryRegistry from 'ember-container-query/template-registry';
import type DemoSelect from 'limber/components/limber/demo-select';
import type Editor from 'limber/components/limber/editor';
import type FrameOutput from 'limber/components/limber/frame-output';
import type Header from 'limber/components/limber/header';
import type Layout from 'limber/components/limber/layout';
import type Output from 'limber/components/limber/output';
import type OutputFramMessaging from 'limber/components/limber/output/frame-messaging';
import type Portals from 'limber/components/limber/portals';
import type Save from 'limber/components/limber/save';
import type inIframe from 'limber/helpers/in-iframe';
import type not from 'limber/helpers/not';
import type service from 'limber/helpers/service';
import type constraintVertically from 'limber/modifiers/constrain-vertically';
import type highlighted from 'limber/modifiers/highlighted';
import type positionedNLines from 'limber/modifiers/positioned-n-lines-from-top';

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry extends EmberContainerQueryRegistry {
    // How to define globals from external addons
    // state: HelperLike<{ Args: {}, Return: State }>;
    // attachShadow: ModifierLike<{ Args: { Positional: [State['update']]}}>;

    /**
     *  Components
     */
    'Limber::DemoSelect': typeof DemoSelect;
    'Limber::Output': typeof Output;
    'Limber::Output::FrameMessaging': typeof OutputFramMessaging;
    'Limber::Portals': typeof Portals;
    'Limber::Save': typeof Save;
    'Limber::Header': typeof Header;
    'Limber::Layout': typeof Layout;
    'Limber::Editor': typeof Editor;
    'Limber::FrameOutput': typeof FrameOutput;

    /**
     * Helpers
     */
    service: typeof service;
    not: typeof not;
    'in-iframe': typeof inIframe;

    /**
     * Modifiers
     */
    highlighted: typeof highlighted;
    'positioned-n-lines-from-top': typeof positionedNLines;
    'constrain-vertically': typeof constraintVertically;
  }
}
