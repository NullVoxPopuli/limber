import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { registerDestructor } from '@ember/destroyable';
import { service } from '@ember/service';

import type { TOC } from '@ember/component/template-only';
import type Owner from '@ember/owner';
import type EditorService from 'limber/services/editor';

export const SHOW_TIME = 2000;

export const SaveBanner = <template>
  <div
    class="pointer-events-none absolute top-[39%] z-[100] w-full border-y border-slate-800/50 bg-slate-800/30 p-10 text-center text-2xl text-white shadow-2xl shadow-stone-900/50 backdrop-blur-md transition-all duration-300
      {{if @isShowing 'opacity-100' 'opacity-0'}}
      "
  >
    URL copied to clipboard
  </div>
</template> satisfies TOC<{ Args: { isShowing: boolean } }>;

export default class Save extends Component {
  <template><SaveBanner @isShowing={{this.isShowing}} /></template>

  @service declare editor: EditorService;

  @tracked isShowing = false;

  constructor(owner: Owner, args: any) {
    super(owner, args);

    const handler = (e: KeyboardEvent) => {
      const isSave = (e.ctrlKey && e.key === 's') || (e.metaKey && e.key === 's');

      if (isSave) {
        e.preventDefault();

        return this.onSave();
      }

      return;
    };

    window.addEventListener('keydown', handler);

    registerDestructor(this, () => window.removeEventListener('keydown', handler));
  }

  onSave = async () => {
    this.isShowing = true;

    try {
      await this.editor.fileURIComponent.toClipboard();
      await new Promise((resolve) => setTimeout(resolve, SHOW_TIME));
    } finally {
      this.isShowing = false;
    }
  };
}
