/**
 * The REPL's file system the way Go's wasm runtime wants it.
 *
 * Go reads files through `globalThis.fs`, with Node's callback API: open,
 * read at a position through a descriptor, fstat, readdir, and errno codes on
 * failure. This serves that API from repl-sdk's storage, so TypeScript sees
 * the same `/node_modules` and `/src` as the compiler, links included.
 *
 * Reads only. The one writer is the fs worker. Files that exist for the Go
 * program alone, a tsconfig for one, live in the overlay and shadow storage.
 *
 * Descriptors 0, 1, and 2 are the process streams: stdin is fed by the host,
 * stdout and stderr call back to it.
 */

const S_IFDIR = 0o040000;
const S_IFREG = 0o100000;

const constants = {
  O_WRONLY: 1,
  O_RDWR: 2,
  O_CREAT: 64,
  O_EXCL: 128,
  O_TRUNC: 512,
  O_APPEND: 1024,
  O_DIRECTORY: 65536,
};

const encoder = new TextEncoder();

/**
 * @typedef {import('repl-sdk/fs/storage').Storage} Storage
 * @typedef {{ type: 'file' | 'directory', size: number, mtime: number }} Stat
 * @typedef {{ name: string, type: 'file' | 'directory' }} Entry
 * @typedef {(error: null | Error, ...results: any[]) => void} Callback
 */

/**
 * @param {string} code an errno name
 */
function failure(code) {
  const error = new Error(code);

  // @ts-ignore the Go runtime reads this to pick the errno
  error.code = code;

  return error;
}

/**
 * @param {string} path
 */
function normalize(path) {
  const parts = [];

  for (const part of path.split('/')) {
    if (part === '' || part === '.') continue;

    if (part === '..') {
      parts.pop();
      continue;
    }

    parts.push(part);
  }

  return `/${parts.join('/')}`;
}

/**
 * @param {string} path
 */
function dirname(path) {
  const slash = path.lastIndexOf('/');

  return slash <= 0 ? '/' : path.slice(0, slash);
}

/**
 * @param {string} path
 */
function basename(path) {
  return path.slice(path.lastIndexOf('/') + 1);
}

/**
 * A stable number per path, because Go compares inodes to tell files apart.
 *
 * @param {string} path
 */
function inodeOf(path) {
  let hash = 7;

  for (let i = 0; i < path.length; i++) {
    hash = (hash * 31 + path.charCodeAt(i)) >>> 0;
  }

  return hash || 1;
}

/**
 * @param {string} path
 * @param {Stat} stat
 */
function statFor(path, stat) {
  const isDir = stat.type === 'directory';
  const size = isDir ? 4096 : stat.size;

  return {
    dev: 1,
    ino: inodeOf(path),
    mode: isDir ? S_IFDIR | 0o755 : S_IFREG | 0o644,
    nlink: 1,
    uid: 0,
    gid: 0,
    rdev: 0,
    size,
    blksize: 4096,
    blocks: Math.ceil(size / 512),
    atimeMs: stat.mtime,
    mtimeMs: stat.mtime,
    ctimeMs: stat.mtime,
    isDirectory: () => isDir,
    isFile: () => !isDir,
  };
}

/**
 * @param {Storage} storage
 * @param {{
 *   onStdout?: (bytes: Uint8Array) => void,
 *   onStderr?: (bytes: Uint8Array) => void,
 * }} [streams]
 */
export function nodeFs(storage, streams = {}) {
  /** @type {Map<string, string>} path → text, shadowing storage */
  const overlay = new Map();

  /**
   * Module resolution probes the same paths over and over. What the storage
   * said stays true until the host says otherwise, because only the fs worker
   * writes and it is told about installs.
   *
   * @type {Map<string, Promise<undefined | Stat>>}
   */
  const stats = new Map();

  /** @type {Map<string, Promise<undefined | Entry[]>>} */
  const listings = new Map();

  /** @type {Map<number, { path: string, bytes: Uint8Array, position: number }>} */
  const descriptors = new Map();
  let nextDescriptor = 3;

  /** @type {Uint8Array[]} */
  const stdin = [];
  /** @type {undefined | (() => void)} */
  let stdinWaiter;

  const onStdout = streams.onStdout ?? ((bytes) => console.info(new TextDecoder().decode(bytes)));
  const onStderr = streams.onStderr ?? ((bytes) => console.error(new TextDecoder().decode(bytes)));

  /**
   * @param {string} path
   * @returns {Promise<undefined | Stat>}
   */
  function statOf(path) {
    const text = overlay.get(path);

    if (text !== undefined) {
      return Promise.resolve({ type: 'file', size: encoder.encode(text).byteLength, mtime: 0 });
    }

    let pending = stats.get(path);

    if (!pending) {
      pending = storage.stat(path);
      stats.set(path, pending);
    }

    return pending;
  }

  /**
   * @param {string} path
   * @returns {Promise<undefined | Entry[]>}
   */
  async function entriesOf(path) {
    let pending = listings.get(path);

    if (!pending) {
      pending = storage.entries(path);
      listings.set(path, pending);
    }

    const stored = await pending;
    /** @type {Entry[]} */
    const merged = stored ? stored.slice() : [];

    for (const file of overlay.keys()) {
      if (dirname(file) !== path) continue;

      const name = basename(file);

      if (!merged.some((entry) => entry.name === name)) merged.push({ name, type: 'file' });
    }

    if (!stored && merged.length === 0) return undefined;

    return merged;
  }

  /**
   * @param {string} path
   * @returns {Promise<undefined | Uint8Array>}
   */
  function bytesOf(path) {
    const text = overlay.get(path);

    if (text !== undefined) return Promise.resolve(encoder.encode(text));

    return storage.readBytes(path);
  }

  /**
   * @param {Uint8Array} bytes
   */
  function pushStdin(bytes) {
    stdin.push(bytes);

    const waiter = stdinWaiter;

    stdinWaiter = undefined;
    waiter?.();
  }

  /**
   * @param {Uint8Array} buffer
   * @param {number} offset
   * @param {number} length
   * @param {Callback} callback
   */
  function readStdin(buffer, offset, length, callback) {
    const serve = () => {
      const chunk = /** @type {Uint8Array} */ (stdin[0]);
      const n = Math.min(length, chunk.byteLength);

      buffer.set(chunk.subarray(0, n), offset);

      if (n === chunk.byteLength) {
        stdin.shift();
      } else {
        stdin[0] = chunk.subarray(n);
      }

      callback(null, n);
    };

    if (stdin.length > 0) {
      serve();
    } else {
      stdinWaiter = serve;
    }
  }

  /**
   * @param {() => Promise<unknown[]>} work
   * @param {Callback} callback
   */
  function answer(work, callback) {
    work().then(
      (results) => callback(null, ...results),
      (error) => callback(error)
    );
  }

  const fs = {
    constants,

    /**
     * @param {number} fd
     * @param {Uint8Array} buffer
     */
    writeSync(fd, buffer) {
      if (fd === 1) onStdout(buffer.slice());
      else if (fd === 2) onStderr(buffer.slice());
      else throw failure('EROFS');

      return buffer.byteLength;
    },

    /**
     * @param {number} fd
     * @param {Uint8Array} buffer
     * @param {number} offset
     * @param {number} length
     * @param {null | number} position
     * @param {Callback} callback
     */
    write(fd, buffer, offset, length, position, callback) {
      if (fd !== 1 && fd !== 2) return callback(failure('EROFS'));

      callback(null, this.writeSync(fd, buffer.subarray(offset, offset + length)));
    },

    /**
     * @param {number} fd
     * @param {Uint8Array} buffer
     * @param {number} offset
     * @param {number} length
     * @param {null | number} position
     * @param {Callback} callback
     */
    read(fd, buffer, offset, length, position, callback) {
      if (fd === 0) return readStdin(buffer, offset, length, callback);

      const open = descriptors.get(fd);

      if (!open) return callback(failure('EBADF'));

      const at = position === null || position === undefined ? open.position : position;
      const n = Math.max(0, Math.min(length, open.bytes.byteLength - at));

      buffer.set(open.bytes.subarray(at, at + n), offset);

      if (position === null || position === undefined) open.position += n;

      callback(null, n);
    },

    /**
     * @param {string} path
     * @param {number} flags
     * @param {number} mode
     * @param {Callback} callback
     */
    open(path, flags, mode, callback) {
      if (flags & (constants.O_WRONLY | constants.O_RDWR | constants.O_CREAT | constants.O_TRUNC)) {
        return callback(failure('EROFS'));
      }

      const normalized = normalize(path);

      answer(async () => {
        const stat = await statOf(normalized);

        if (!stat) throw failure('ENOENT');
        if (flags & constants.O_DIRECTORY && stat.type !== 'directory') throw failure('ENOTDIR');

        const bytes = stat.type === 'file' ? await bytesOf(normalized) : new Uint8Array(0);

        if (!bytes) throw failure('ENOENT');

        const fd = nextDescriptor++;

        descriptors.set(fd, { path: normalized, bytes, position: 0 });

        return [fd];
      }, callback);
    },

    /**
     * @param {number} fd
     * @param {Callback} callback
     */
    close(fd, callback) {
      descriptors.delete(fd);
      callback(null);
    },

    /**
     * @param {number} fd
     * @param {Callback} callback
     */
    fstat(fd, callback) {
      const open = descriptors.get(fd);

      if (!open) return callback(failure('EBADF'));

      answer(async () => {
        const stat = await statOf(open.path);

        if (!stat) throw failure('ENOENT');

        return [statFor(open.path, stat)];
      }, callback);
    },

    /**
     * @param {string} path
     * @param {Callback} callback
     */
    stat(path, callback) {
      const normalized = normalize(path);

      answer(async () => {
        const stat = await statOf(normalized);

        if (!stat) throw failure('ENOENT');

        return [statFor(normalized, stat)];
      }, callback);
    },

    /**
     * @param {string} path
     * @param {Callback} callback
     */
    lstat(path, callback) {
      this.stat(path, callback);
    },

    /**
     * @param {string} path
     * @param {Callback} callback
     */
    readdir(path, callback) {
      const normalized = normalize(path);

      answer(async () => {
        const stat = await statOf(normalized);

        if (!stat) throw failure('ENOENT');
        if (stat.type !== 'directory') throw failure('ENOTDIR');

        const entries = (await entriesOf(normalized)) ?? [];

        return [entries.map((entry) => entry.name)];
      }, callback);
    },

    /**
     * Nothing in storage is a symlink; the links are directories with a marker.
     *
     * @param {string} path
     * @param {Callback} callback
     */
    readlink(path, callback) {
      answer(async () => {
        const stat = await statOf(normalize(path));

        throw failure(stat ? 'EINVAL' : 'ENOENT');
      }, callback);
    },

    /**
     * @param {number} fd
     * @param {Callback} callback
     */
    fsync(fd, callback) {
      callback(null);
    },
    /**
     * @param {string} path
     * @param {number} perm
     * @param {Callback} callback
     */
    mkdir(path, perm, callback) {
      callback(failure('EROFS'));
    },
    /**
     * @param {string} path
     * @param {Callback} callback
     */
    rmdir(path, callback) {
      callback(failure('EROFS'));
    },
    /**
     * @param {string} path
     * @param {Callback} callback
     */
    unlink(path, callback) {
      callback(failure('EROFS'));
    },
    /**
     * @param {string} from
     * @param {string} to
     * @param {Callback} callback
     */
    rename(from, to, callback) {
      callback(failure('EROFS'));
    },
    /**
     * @param {string} path
     * @param {number} length
     * @param {Callback} callback
     */
    truncate(path, length, callback) {
      callback(failure('EROFS'));
    },
    /**
     * @param {number} fd
     * @param {number} length
     * @param {Callback} callback
     */
    ftruncate(fd, length, callback) {
      callback(failure('EROFS'));
    },
    /**
     * @param {string} path
     * @param {number} atime
     * @param {number} mtime
     * @param {Callback} callback
     */
    utimes(path, atime, mtime, callback) {
      callback(failure('EROFS'));
    },
    /**
     * @param {string} path
     * @param {number} mode
     * @param {Callback} callback
     */
    chmod(path, mode, callback) {
      callback(null);
    },
    /**
     * @param {number} fd
     * @param {number} mode
     * @param {Callback} callback
     */
    fchmod(fd, mode, callback) {
      callback(null);
    },
    /**
     * @param {string} path
     * @param {number} uid
     * @param {number} gid
     * @param {Callback} callback
     */
    chown(path, uid, gid, callback) {
      callback(null);
    },
    /**
     * @param {number} fd
     * @param {number} uid
     * @param {number} gid
     * @param {Callback} callback
     */
    fchown(fd, uid, gid, callback) {
      callback(null);
    },
    /**
     * @param {string} path
     * @param {number} uid
     * @param {number} gid
     * @param {Callback} callback
     */
    lchown(path, uid, gid, callback) {
      callback(null);
    },
    /**
     * @param {string} path
     * @param {string} link
     * @param {Callback} callback
     */
    link(path, link, callback) {
      callback(failure('EROFS'));
    },
    /**
     * @param {string} path
     * @param {string} link
     * @param {Callback} callback
     */
    symlink(path, link, callback) {
      callback(failure('EROFS'));
    },
  };

  const process = {
    getuid: () => 0,
    getgid: () => 0,
    geteuid: () => 0,
    getegid: () => 0,
    getgroups: () => [],
    pid: 1,
    ppid: 0,
    umask: () => 0o22,
    cwd: () => '/',
    chdir: () => {},
  };

  return {
    fs,
    process,
    pushStdin,

    /**
     * A file the Go program sees that is not in storage, or a newer version
     * of one that is.
     *
     * @param {string} path
     * @param {string} text
     */
    overlay(path, text) {
      overlay.set(normalize(path), text);
    },

    /**
     * Storage changed underneath, an install for one. Forget what it said.
     */
    invalidate() {
      stats.clear();
      listings.clear();
    },
  };
}
