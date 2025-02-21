import type Docs from 'tutorial/services/docs';
import type Selected from 'tutorial/services/selected';

declare module '@ember/service' {
  export interface Registry {
    selected: Selected;
    docs: Docs;
  }
}
