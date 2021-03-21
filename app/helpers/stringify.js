import { helper } from '@ember/component/helper';

import stringifyObject from 'stringify-object';

const options = {
  indent: '  ',
  singleQuotes: false,
  inlineCharacterLimit: 12,
};

export default helper(([value]) => stringifyObject(value, options));
