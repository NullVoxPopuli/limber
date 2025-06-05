import { expect as errorExpect, it } from 'vitest';

import { Request } from './request.js';
import { resolve } from './resolve.js';

import type { UntarredPackage } from './types.js';

const expect = errorExpect.soft;

it('resolves the entrypoint (rehype-raw)', () => {
  const untarred = {
    contents: {
      'index.js': 'entry file',
    },
    manifest: {
      exports: './index.js',
    },
  };
  const request = Request.fromSpecifier('rehype-raw');
  const answer = resolve(untarred as unknown as UntarredPackage, request);

  expect(answer?.inTarFile).toBe('index.js');
});
