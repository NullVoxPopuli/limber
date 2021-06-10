import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { registerDestructor } from '@ember/destroyable';
import { action } from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';

import Popper from '@popperjs/core';
// could use ember-modifier here as well
import { modifier } from 'ember-could-get-used-to-this';

interface Args {
  placement?: Popper.Placement;
}

const showEvents = ['mouseenter', 'focus'];
const hideEvents = ['mouseleave', 'blur'];

class PopperJS extends Component<Args> {
  declare _triggerElement: HTMLElement;
  declare _popoverElement: HTMLElement;

  trigger = modifier((element) => {
    this._triggerElement = element;

    if (this._popoverElement) this.initPopper();
  });

  popover = modifier((element) => {
    this._popoverElement = element;

    if (this._triggerElement) this.initPopper();
  });

  @action
  initPopper() {
    let { _popoverElement: popover, _triggerElement: trigger } = this;
    let { placement } = this.args;

    let popper = Popper.createPopper(trigger, popover, {
      placement: placement || 'bottom',
    });

    let hide = () => popover.removeAttribute('data-show');
    let show = () => {
      popover.setAttribute('data-show', '');
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
    {{yield this.trigger this.popover}}
  `,
  PopperJS
);
