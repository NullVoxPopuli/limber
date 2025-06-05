import { expect as errorExpect, it } from 'vitest';

import { idForRequest, Request } from './request.js';
import { fromInternalImport } from './resolve.js';

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

  const from = idForRequest({ to: 'content-tag' });
  const request = Request.of({ to: './standalone/content_tag.js', from });
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
  const from = idForRequest({ to: 'rehype-raw' });
  const request = Request.of({ to: './lib/index.js', from });
  const answer = fromInternalImport(untarred as unknown as UntarredPackage, request, undefined);

  expect(answer?.inTarFile).toBe('pkg/lib/index.js');
});

it('resolves the entrypoint (unist-util-visit)', () => {
  const untarred = {
    contents: {
      'index.js': 'contents',
      'lib/index.js': 'contents',
    },
    manifest: {
      exports: './index.js',
    },
  };
  const from = idForRequest({ to: 'unist-util-visit' });
  const request = Request.of({ to: './lib/index.js', from });
  const answer = fromInternalImport(untarred as unknown as UntarredPackage, request, undefined);

  expect(answer?.inTarFile).toBe('lib/index.js');
});
