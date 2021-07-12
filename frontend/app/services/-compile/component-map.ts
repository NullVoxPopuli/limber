/* eslint-disable @typescript-eslint/ban-ts-comment */
/*
 * TypeScript does not know what to do with template-only components
 */
// @ts-ignore
import * as ExternalLink from 'limber/components/external-link';
// @ts-ignore
import * as Menu from 'limber/components/limber/menu';
import * as Popper from 'limber/components/popper-j-s';

export const COMPONENT_MAP = {
  'limber/components/limber/menu': Menu,
  'limber/components/external-link': ExternalLink,
  'limber/components/popper-j-s': Popper,
};
