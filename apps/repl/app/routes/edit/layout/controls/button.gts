import type { TOC } from '@ember/component/template-only';

export const buttonClasses = `
  block select-none py-2 px-3 text-white text-xs
  hover:bg-[#9b2918]
  focus:ring-4 ring-inset focus:outline-none
  disabled:opacity-30
`;

export const Button: TOC<{
  Element: HTMLButtonElement;
  Blocks: { default: [] };
}> = <template>
  <button type="button" class={{buttonClasses}} ...attributes>
    {{yield}}
  </button>
</template>;
