import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import EditorService from 'limber/services/editor';
import { registerDestructor } from '@ember/destroyable';

const SHOW_TIME = 2000;

export default class Save extends Component {
  <template>
    <div class="
      w-full p-10 fixed text-2xl
      backdrop-blur-md bg-slate-800/30
      border-y border-slate-800/50
      transition-all duration-300
      pointer-events-none
      text-white shadow-2xl text-center z-[100] top-[39%]
      {{if this.isShowing 'opacity-100' 'opacity-0'}}
    "
    >
      URL copied to clipboard
    </div>
  </template>

  @service declare editor: EditorService;

  @tracked isShowing = false;

  constructor(owner: unknown, args: {}) {
    super(owner, args);

    const handler = (e: KeyboardEvent) => {
      let isSave = (e.ctrlKey && e.key === 's') || (e.metaKey && e.key === 's');

      if (isSave) {
        e.preventDefault();

        return this.onSave();
      }

      return;
    }

    window.addEventListener('keydown', handler);

    registerDestructor(this, () => window.removeEventListener('keydown', handler));
  }


  onSave = async () => {
    this.isShowing = true;
    await this.editor.fileURIComponent.toClipboard();
    await new Promise(resolve => setTimeout(resolve, SHOW_TIME));
    this.isShowing = false;
  }
}
