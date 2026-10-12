import type { TOC } from '@ember/component/template-only';

export const Type: TOC<{
  Args: {
    name: string;
    type: string;
  };
  Blocks: {
    default: [];
  };
}> = <template>
  <div><code>{{@name}}</code>
    <span><code>{{@type}}</code></span>
    <p>
      {{yield}}
    </p>
  </div>
</template>;
