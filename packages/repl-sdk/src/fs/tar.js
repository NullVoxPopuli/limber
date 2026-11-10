const BLOCK = 512;

const decoder = new TextDecoder();

/**
 * @param {Uint8Array} bytes
 * @param {number} start
 * @param {number} length
 */
function field(bytes, start, length) {
  const slice = bytes.subarray(start, start + length);
  const end = slice.indexOf(0);

  return decoder.decode(end === -1 ? slice : slice.subarray(0, end));
}

/**
 * @param {Uint8Array} bytes
 * @param {number} start
 * @param {number} length
 */
function octal(bytes, start, length) {
  return parseInt(field(bytes, start, length).trim() || '0', 8);
}

/**
 * PAX records are `<length> <key>=<value>\n`.
 *
 * @param {Uint8Array} data
 * @returns {string | undefined}
 */
function paxPath(data) {
  for (const record of decoder.decode(data).split('\n')) {
    const match = /^\d+ path=(.*)$/.exec(record);

    if (match) return match[1];
  }
}

/**
 * @param {ArrayBuffer} gzipped
 */
async function gunzip(gzipped) {
  const stream = new Blob([gzipped]).stream().pipeThrough(new DecompressionStream('gzip'));

  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/**
 * The files of an npm tarball, by path inside the package.
 *
 * npm packs into one top folder, usually `package/`, which is left out.
 * Paths longer than 100 characters come three ways:
 *
 * - ustar: a `prefix` field, joined to the name with `/`
 * - PAX: an `x` entry with a `path` record for the next file
 * - GNU: an `L` entry whose data is the next file's name
 *
 * @param {ArrayBuffer} gzipped
 * @returns {Promise<{ [path: string]: { text: string } }>}
 */
export async function untar(gzipped) {
  const bytes = await gunzip(gzipped);

  /** @type {{ [path: string]: { text: string } }} */
  const files = {};

  /** @type {string | undefined} */
  let longName;
  let offset = 0;

  while (offset + BLOCK <= bytes.length) {
    const name = field(bytes, offset, 100);

    if (!name) break;

    const size = octal(bytes, offset + 124, 12);
    const type = String.fromCharCode(bytes[offset + 156] ?? 0);
    const prefix = field(bytes, offset + 345, 155);
    const dataStart = offset + BLOCK;
    const data = bytes.subarray(dataStart, dataStart + size);

    offset = dataStart + Math.ceil(size / BLOCK) * BLOCK;

    if (type === 'x') {
      longName = paxPath(data);
      continue;
    }

    if (type === 'L') {
      longName = field(data, 0, data.length);
      continue;
    }

    const path = longName ?? (prefix ? `${prefix}/${name}` : name);

    longName = undefined;

    /**
     * '0' is a file, and so is NUL in old archives.
     */
    if (type !== '0' && type !== '\0') continue;

    const inPackage = path.slice(path.indexOf('/') + 1);
    const text = decoder.decode(data);

    files[inPackage] = { text };
  }

  return files;
}
