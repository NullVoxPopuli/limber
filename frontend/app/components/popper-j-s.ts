import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { setComponentTemplate } from '@ember/component';
import { registerDestructor } from '@ember/destroyable';
import { action } from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';

import { createPopper } from '@popperjs/core';
// could use ember-modifier here as well
import { modifier } from 'ember-could-get-used-to-this';

import type Popper from '@popperjs/core';

interface Args {
  placement?: Popper.Placement;
}

const showEvents = ['mouseenter', 'focus', 'click'];
const hideEvents = ['mouseleave', 'blur'];

class PopperJS extends Component<Args> {
  declare _triggerElement?: HTMLElement;
  declare _popoverElement?: HTMLElement;

  @tracked isShown = false;

  trigger = modifier((element: HTMLElement) => {
    this._triggerElement = element;

    if (this._popoverElement) this.setupPopper();
  });

  popover = modifier((element: HTMLElement) => {
    this._popoverElement = element;

    if (this._triggerElement) this.setupPopper();
  });

  @action
  setupPopper() {
    const { _popoverElement: popover, _triggerElement: trigger } = this;
    const { placement } = this.args;

    if (!popover) return;
    if (!trigger) return;

    let popper = createPopper(trigger, popover, {
      placement: placement || 'bottom',
    });

    let hide = () => (this.isShown = false);
    let show = () => {
      this.isShown = true;
      popper.update();
    };

    showEvents.forEach((event) => {
      trigger.addEventListener(event, show);
    });

    hideEvents.forEach((event) => {
      trigger.addEventListener(event, hide);
    });

    registerDestructor(this, () => popper.destroy());
  }
}

export default setComponentTemplate(
  hbs`
    {{yield this.trigger this.popover this.isShown}}
  `,
  PopperJS
);
