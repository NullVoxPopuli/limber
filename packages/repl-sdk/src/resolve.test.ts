import { expect as errorExpect, it } from 'vitest';

import { resolve } from './resolve.js';

import type { ResolveRequest } from './resolve.js';
import type { UntarredPackage } from './types.js';

const expect = errorExpect.soft;

function request(name: string, to = '.'): ResolveRequest {
  return { name, version: '1.0.0', to, original: name, key: `${name}@1.0.0/${to}` };
}

it('resolves the entrypoint (rehype-raw)', () => {
  const untarred = {
    files: ['index.js'],
    manifest: {
      exports: './index.js',
    },
  };

  const answer = resolve(untarred as unknown as UntarredPackage, request('rehype-raw'));

  expect(answer?.inTarFile).toBe('index.js');
});
