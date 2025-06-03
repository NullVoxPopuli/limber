import { expect as errorExpect, it } from 'vitest';

import { fromInternalImport, Request } from './resolve.js';

import type { UntarredPackage } from './types.js';

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
    './standalone/content_tag.js?from=tgz%3A%2F%2Frepl.sdk%2Fcontent-tag';
  const request = Request.fromSpecifier(specifier);
  const answer = fromInternalImport(untarred as unknown as UntarredPackage, request, undefined);

  expect(answer?.inTarFile).toBe('pkg/standalone/content_tag.js');
});


it('resolves a private file (rehype-raw)', () => {
  const untarred = {
    contents: {
      'pkg/index.js': 'entry file',
      'pkg/lib/index.js': 'target file',
    },
    manifest: {
      exports: './index.js',
    },
  };
  const specifier = './lib/index.js?from=tgz://repl.sdk/rehype-raw';
  const request = Request.fromSpecifier(specifier);
  const answer = fromInternalImport(untarred as unknown as UntarredPackage, request, undefined);

  expect(answer?.inTarFile).toBe('pkg/lib/index.js');
});
