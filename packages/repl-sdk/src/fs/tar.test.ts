import { describe, expect, it } from 'vitest';

import { untar } from './tar.js';

const encoder = new TextEncoder();

/**
 * One tar entry: a 512 byte header, then the data padded to 512 bytes.
 * The reader ignores the checksum, so the header only holds what it reads.
 */
function entry(options: { name: string; prefix?: string; type?: string; data: string }) {
  const data = encoder.encode(options.data);
  const header = new Uint8Array(512);

  header.set(encoder.encode(options.name), 0);
  header.set(encoder.encode(data.length.toString(8).padStart(11, '0')), 124);
  header.set(encoder.encode(options.type ?? '0'), 156);

  if (options.prefix) header.set(encoder.encode(options.prefix), 345);

  const padded = new Uint8Array(Math.ceil(data.length / 512) * 512);

  padded.set(data);

  return [header, padded];
}

async function tarball(...entries: Uint8Array[][]): Promise<ArrayBuffer> {
  const blocks = entries.flat();
  const end = new Uint8Array(1024);
  const size = blocks.reduce((total, block) => total + block.length, 0) + end.length;
  const tar = new Uint8Array(size);
  let offset = 0;

  for (const block of blocks) {
    tar.set(block, offset);
    offset += block.length;
  }

  const stream = new Blob([tar]).stream().pipeThrough(new CompressionStream('gzip'));

  return new Response(stream).arrayBuffer();
}

const longDir = 'dist/dev/packages/@ember/template-compiler/lib/plugins';
const longFile = 'transform-quoted-bindings-into-just-bindings.js';

describe('untar', () => {
  it('drops the top folder', async () => {
    const files = await untar(await tarball(entry({ name: 'package/index.js', data: 'a' })));

    expect(Object.keys(files)).toEqual(['index.js']);
    expect(files['index.js']?.text).toBe('a');
  });

  it('joins a ustar prefix to the name with a slash', async () => {
    const files = await untar(
      await tarball(entry({ prefix: `package/${longDir}`, name: longFile, data: 'b' }))
    );

    expect(Object.keys(files)).toEqual([`${longDir}/${longFile}`]);
  });

  it('takes the path of a PAX record', async () => {
    const path = `package/${longDir}/${longFile}`;
    const record = `${path.length + 10} path=${path}\n`;
    const files = await untar(
      await tarball(
        entry({ name: 'PaxHeader', type: 'x', data: record }),
        entry({ name: 'truncated', data: 'c' })
      )
    );

    expect(Object.keys(files)).toEqual([`${longDir}/${longFile}`]);
    expect(files[`${longDir}/${longFile}`]?.text).toBe('c');
  });

  it('takes the name of a GNU long name entry', async () => {
    const files = await untar(
      await tarball(
        entry({ name: '././@LongLink', type: 'L', data: `package/${longDir}/${longFile}` }),
        entry({ name: 'truncated', data: 'd' })
      )
    );

    expect(Object.keys(files)).toEqual([`${longDir}/${longFile}`]);
  });

  it('skips folders', async () => {
    const files = await untar(
      await tarball(
        entry({ name: 'package/lib/', type: '5', data: '' }),
        entry({ name: 'package/lib/a.js', data: 'e' })
      )
    );

    expect(Object.keys(files)).toEqual(['lib/a.js']);
  });
});
