import { expect as errorExpect, it } from 'vitest';

import { fromInternalImport, Request } from './resolve.js';

const expect = errorExpect.soft;

it('resolves a private file (content-tag)', () => {
  const untarred = {
    contents: {
      'pkg/standalone.js': 'entry file',
      'pkg/standalone/content_tag.js': 'target file',
    },
    manifest: {
      exports: {
        '.': {
          browser: { default: './pkg/standalone.js' },
          default: { default: './pkg/node.cjs' },
        },
        './standalone': {
          import: { default: './pkg/standalone.js' },
          require: { default: './pkg/stubs/require.cjs' },
        },
      },
    },
  };
  const specifier =
    'content-tag/standalone/content_tag.js?from=tgz%3A%2F%2Frepl.sdk%2Fcontent-tag&to=.%2Fstandalone%2Fcontent_tag.js';
  const request = Request.fromSpecifier(specifier);
  const answer = fromInternalImport(untarred, request, undefined);

  expect(answer?.inTarFile).toBe('pkg/standalone/content_tag.js');
});
