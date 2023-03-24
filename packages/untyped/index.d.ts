declare module '@fortawesome/ember-fontawesome/components/fa-icon' {
  import { ComponentLike } from '@glint/template';

  const FaIcon: ComponentLike<{
    Element: SVGElement;
    Args: {
      icon: string;
      prefix?: string;
    };
  }>;

  export default FaIcon;
}
