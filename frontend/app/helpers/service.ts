import { getOwner } from '@ember/application';
import Helper from '@ember/component/helper';

export default class GetService extends Helper {
  compute([name]: [string]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getOwner(this) as any) /* TYPE IS INCORRECT */
      .lookup(`service:${name}`);
  }
}
