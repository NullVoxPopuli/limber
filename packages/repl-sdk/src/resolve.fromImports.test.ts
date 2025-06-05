import { expect as errorExpect, it } from 'vitest';

import { idForRequest, Request } from './request.js';
import { fromImports } from './resolve.js';

import type { UntarredPackage } from './types.js';

const expect = errorExpect.soft;

it('resolves subpath imports', () => {
  const untarred = {
    contents: {
      'pkg/standalone.js': 'entry file',
      'pkg/compiler.js': 'target file',
      'pkg/compiler/example.js': 'target file',
    },
    manifest: {
      exports: {
        '.': {
          browser: { default: './pkg/standalone.js' },
          default: { default: './pkg/node.cjs' },
        },
      },
      imports: {
        '#compiler': './pkg/compiler.js',
        '#compiler/*': './pkg/compiler/*.js',
      },
    },
  };
  const from = idForRequest({ to: 'content-tag' });
  const request = Request.of({ to: '#compiler', from });
  const answer = fromImports(untarred as unknown as UntarredPackage, request, undefined);

  expect(answer?.inTarFile).toBe('pkg/compiler.js');
});
