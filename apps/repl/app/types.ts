import type { ComponentLike } from '@glint/template';

/**
 * Component type that takes no
 * - attributes
 * - arguments
 * - blocks
 */
export type SimpleComponent = ComponentLike<{
  Element: null;
}>;
