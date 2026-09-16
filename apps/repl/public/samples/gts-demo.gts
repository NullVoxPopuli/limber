import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

import type { TOC } from '@ember/component/template-only';

const Count: TOC<{ Args: { value: number } }> = <template>
  <p>You have clicked the button {{@value}} times.</p>
</template>;

interface Signature {
  Args: {
    start?: number;
  };
}

export default class HelloWorld extends Component<Signature> {
  @tracked count: number = this.args.start ?? 0;

  increment = (): void => {
    this.count += 1;
  };

  <template>
    <Count @value={{this.count}} />

    <button type="button" {{on "click" this.increment}}>Click</button>
  </template>
}
