import type { TOC } from '@ember/component/template-only';

const colorsFor = (variant: 'primary' | 'default' | 'secondary' | undefined) => {
  if (variant === 'default' || variant === undefined) {
    return 'text-white bg-[var(--code-bg)] hover:bg-[var(--code-highlight-bg)]';
  }

  if (variant === 'primary') {
    return 'text-black font-bold bg-[var(--horizon-blue)]';
  }

  if (variant === 'secondary') {
    return 'text-black font-bold bg-[var(--horizon-yellow)]';
  }
};

export const Button: TOC<{
  Element: HTMLButtonElement;
  Args: {
    variant?: 'primary' | 'default' | 'secondary';
  };
  Blocks: { default: [] };
}> = <template>
  <button
    type="button"
    class="{{colorsFor @variant}}
      inline-block grid grid-flow-col items-center gap-2 rounded border border-[var(--horizon-border)] px-3 py-2 shadow hover:shadow-sm focus:outline-none focus:ring focus-visible:outline-none focus-visible:ring disabled:opacity-30"
    ...attributes
  >
    {{yield}}
  </button>
</template>;
