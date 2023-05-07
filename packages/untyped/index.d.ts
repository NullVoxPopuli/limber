declare module '@fortawesome/ember-fontawesome/components/fa-icon' {
  import type { ComponentLike } from '@glint/template';

  const FaIcon: ComponentLike<{
    Element: SVGElement;
    Args: {
      icon: string;
      size?: string;
      prefix?: string;
    };
  }>;

  export default FaIcon;
}
