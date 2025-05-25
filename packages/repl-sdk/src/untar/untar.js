import { getChecksum, INITIAL_CHKSUM, RECORD_SIZE } from './utils.js';

const decoder = new TextDecoder();
const ENTRY_TYPES = {
  0: 'file',
  1: 'link',
  2: 'symlink',
  3: 'character_device',
  4: 'block_device',
  5: 'directory',
  6: 'fifo',
  7: 'contiguous_file',
};

/**
 * Reads tar archive from a stream
 * @param {ReadableStream<Uint8Array>} stream
 * @returns {AsyncGenerator<TarEntry>}
 */
export async function* untar(stream) {
  const reader = stream.getReader();
  const header = new Uint8Array(RECORD_SIZE);
  let read = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    let chunk = value;

    while (chunk.byteLength > 0) {
      const remaining = Math.min(chunk.byteLength, RECORD_SIZE - read);

      header.set(chunk.subarray(0, remaining), read);
      chunk = chunk.subarray(remaining);
      read += remaining;

      if (read === 512) {
        //   // validate checksum
        //   {
        //     const expected = readOctal(header, 148, 8);
        //     const actual = getChecksum(header);
        //
        //     if (expected !== actual) {
        //       if (actual === INITIAL_CHKSUM) {
        //         break;
        //       }
        //
        //       console.log(header);
        //       throw new Error(`invalid checksum, expected ${expected} got ${actual}`);
        //     }
        //   }

        // validate magic
        // {
        //   const magic = readString(header, 257, 8);
        //
        //   if (!magic.startsWith('ustar')) {
        //     throw new Error(`unsupported archive format: ${magic}`);
        //   }
        // }

        const { promise, resolve } = Promise.withResolvers();
        const entry = new TarEntry(header, reader, chunk, resolve);

        yield entry;

        if (entry.size > 0) {
          if (!entry.bodyUsed) {
            await entry.skip();
          }

          chunk = await promise;
        }

        read = 0;
      }
    }
  }
}

class TarEntry {
  /** 512-byte header chunk */
  #header;
  /** Memoized result for `this.size` */
  #sizeField;
  /** @default false */
  #bodyUsed = false;
  #reader;
  #buffered;
  #callback;
  /**
   * @param {Uint8Array} header
   * @param {ReadableStreamDefaultReader} reader
   * @param {Uint8Array} buffered
   * @param {(remaining: Uint8Array) => void} callback
   */
  constructor(header, reader, buffered, callback) {
    this.#header = header;
    this.#reader = reader;
    this.#buffered = buffered.byteLength > 0 ? buffered : undefined;
    this.#callback = callback;
  }
  /**
   * File name
   * @returns {string}
   */
  get name() {
    const header = this.#header;
    const name = readString(header, 0, 100);
    const prefix = readString(header, 345, 155);

    return prefix.length > 0 ? prefix + '/' + name : name;
  }
  /**
   * File permissions
   * @returns {number}
   */
  get mode() {
    return readOctal(this.#header, 100, 8);
  }
  /**
   * User ID
   * @returns {number}
   */
  get uid() {
    return readOctal(this.#header, 108, 8);
  }
  /**
   * Group ID
   * @returns {number}
   */
  get gid() {
    return readOctal(this.#header, 116, 8);
  }
  /**
   * File size
   * @returns {number}
   */
  get size() {
    return (this.#sizeField ??= readOctal(this.#header, 124, 12));
  }
  /**
   * Modified time
   * @returns {number}
   */
  get mtime() {
    return readOctal(this.#header, 136, 12);
  }
  /**
   * File type
   * @returns {EntryType}
   */
  get type() {
    const type = readOctal(this.#header, 156, 1);

    return ENTRY_TYPES[type];
  }
  /**
   * Link name
   * @returns {string}
   */
  get linkName() {
    return readString(this.#header, 157, 100);
  }
  /**
   * Owner name
   * @returns {string}
   */
  get owner() {
    return readString(this.#header, 265, 32);
  }
  /**
   * Group name
   * @returns {string}
   */
  get group() {
    return readString(this.#header, 297, 32);
  }
  /**
   * @returns {ReadableStream<Uint8Array>}
   */
  get #stream() {
    let remaining = Math.ceil(this.size / RECORD_SIZE) * RECORD_SIZE;

    return new ReadableStream({
      start: () => {
        if (this.#bodyUsed) {
          throw new Error(`Body already consumed`);
        }

        this.#bodyUsed = true;
      },
      pull: async (controller) => {
        if (remaining === 0) {
          controller.close();

          return;
        }

        let chunk;

        if (this.#buffered) {
          chunk = this.#buffered;
          this.#buffered = undefined;
        } else {
          const result = await this.#reader.read();

          if (result.done) {
            controller.error(new Error(`Unexpected end of stream`));

            return;
          }

          chunk = result.value;
        }

        const reading = Math.min(remaining, chunk.length);

        controller.enqueue(remaining > reading ? chunk : chunk.subarray(0, reading));
        remaining -= reading;

        if (remaining === 0) {
          this.#callback(chunk.subarray(reading));
          controller.close();
        }
      },
    });
  }
  /**
   * Whether the body has been consumed
   * @returns {boolean}
   */
  get bodyUsed() {
    return this.#bodyUsed;
  }
  /**
   * Get a readable stream of the file contents
   * @returns {ReadableStream<Uint8Array>}
   */
  get body() {
    const reader = this.#stream.getReader();
    let remaining = this.size;

    return new ReadableStream({
      pull: async (controller) => {
        if (remaining === 0) {
          controller.close();

          return;
        }

        const { done, value: chunk } = await reader.read();

        if (done) {
          controller.error(new Error(`Unexpected end of stream`));

          return;
        }

        const reading = Math.min(remaining, chunk.length);

        controller.enqueue(remaining > reading ? chunk : chunk.subarray(0, reading));
        remaining -= reading;

        if (remaining === 0) {
          // Read through the padding
          // deno-lint-ignore no-empty
          while (!(await reader.read()).done) {}

          controller.close();
        }
      },
    });
  }
  /**
   * Skip reading this entry. There's no need to call this manually, it will be skipped if not used
   * @returns {Promise<void>}
   */
  async skip() {
    const reader = this.#stream.getReader();

    // deno-lint-ignore no-empty
    while (!(await reader.read()).done) {}
  }
  /**
   * Read the file contents to an array buffer
   * @returns {Promise<ArrayBuffer>}
   */
  async arrayBuffer() {
    const uint8 = new Uint8Array(this.size);
    let offset = 0;

    for await (const chunk of this.body) {
      uint8.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return uint8.buffer;
  }
  /**
   * Read the file contents as a string
   * @returns {Promise<string>}
   */
  async text() {
    const bytes = await this.arrayBuffer();

    return decoder.decode(bytes);
  }
  /**
   * Read the file contents as a JSON
   * @returns {Promise<any>}
   */
  // deno-lint-ignore no-explicit-any
  async json() {
    const text = await this.text();

    return JSON.parse(text);
  }
}

/**
 * @param {Uint8Array} arr
 * @param {number} offset
 * @param {number} size
 * @returns {string}
 */
function readString(arr, offset, size) {
  let input = arr.subarray(offset, offset + size);

  for (let idx = 0, len = input.length; idx < len; idx++) {
    const code = input[idx];

    if (code === 0) {
      input = input.subarray(0, idx);

      break;
    }
  }

  return decoder.decode(input);
}

/**
 * @param {Uint8Array} arr
 * @param {number} offset
 * @param {number} size
 * @returns {number}
 */
function readOctal(arr, offset, size) {
  const res = readString(arr, offset, size);

  return res ? parseInt(res, 8) : 0;
}
/**
 * Entry file type
 * @typedef {| 'file'
 * 	| 'link'
 * 	| 'symlink'
 * 	| 'character_device'
 * 	| 'block_device'
 * 	| 'directory'
 * 	| 'fifo'
 * 	| 'contiguous_file'} EntryType
 */
/**
 * Provides the ability to read variably-sized buffers
 * @typedef {Object} Reader
 */
