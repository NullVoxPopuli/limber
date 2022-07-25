
declare module 'ember-container-query/components/container-query' {
  import type { ComponentLike } from "@glint/template";

  const ContainerQuery: ComponentLike<{
    Element: HTMLDivElement;
    Args: {
      features: any;
    };
    Blocks: {
      default: [any]
    }
  }>;

  export default ContainerQuery;

}
