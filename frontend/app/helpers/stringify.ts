import { helper } from '@ember/component/helper';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import stringifyObject from 'stringify-object';

const options = {
  indent: '  ',
  singleQuotes: false,
  inlineCharacterLimit: 80,
};

export default helper(([value]: [string]) => stringifyObject(value, options));
