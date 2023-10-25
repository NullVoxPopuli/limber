import type { TOC } from '@ember/component/template-only';

const colorsFor = (variant: 'primary' | 'default' | undefined) => {
  if (variant === 'default' || variant === undefined) {
    return 'text-white bg-[var(--code-bg)] hover:bg-[var(--code-highlight-bg)]';
  }

  if (variant === 'primary') {
    return 'text-black font-bold bg-[var(--horizon-blue)]';
  }
};

export const Button: TOC<{
  Element: HTMLButtonElement;
  Args: {
    variant?: 'primary' | 'default';
  };
  Blocks: { default: [] };
}> = <template>
  <button
    type="button"
    class="{{colorsFor @variant}}
      inline-block items-center grid-flow-col rounded px-3 py-2 border border-[var(--horizon-border)] focus:outline-none focus:ring focus-visible:outline-none focus-visible:ring shadow hover:shadow-sm grid gap-2 disabled:opacity-30"
    ...attributes
  >
    {{yield}}
  </button>
</template>;
