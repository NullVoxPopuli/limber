import Component from '@glimmer/component';

import codemirror from './-code-mirror';
import monaco from './monaco';

export default class Editor extends Component {
  monaco = monaco;
  codemirror = codemirror;
}
