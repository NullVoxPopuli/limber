import { expect as errorExpect, it } from 'vitest';

import { fromImports } from './resolve.js';

import type { ResolveRequest } from './resolve.js';
import type { UntarredPackage } from './types.js';

const expect = errorExpect.soft;

it('resolves subpath imports', () => {
  const untarred = {
    files: ['pkg/standalone.js', 'pkg/compiler.js', 'pkg/compiler/example.js'],
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

  /**
   * A subpath import used to need the importing module threaded in as a
   * parent Request. The package the import belongs to is all that ever
   * mattered, and a URL carries that.
   */
  const request: ResolveRequest = {
    name: 'content-tag',
    version: '1.0.0',
    to: '#compiler',
    original: 'content-tag#compiler',
    key: 'content-tag@1.0.0/#compiler',
  };

  const answer = fromImports(untarred as unknown as UntarredPackage, request, undefined);

  expect(answer?.inTarFile).toBe('pkg/compiler.js');
});
