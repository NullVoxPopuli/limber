// In-memory file system for Go's js/wasm runtime.
// Implements the subset of the Node fs callback API that syscall/fs_js.go calls.

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

function makeError(code) {
  const error = new Error(code);

  error.code = code;

  return error;
}

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

  return '/' + parts.join('/');
}

function dirname(path) {
  const i = path.lastIndexOf('/');

  return i <= 0 ? '/' : path.slice(0, i);
}

function basename(path) {
  return path.slice(path.lastIndexOf('/') + 1);
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

let nextIno = 1;
const nodes = new Map();

nodes.set('/', { type: 'dir', ino: nextIno++, mtime: Date.now(), children: new Set() });

function get(path) {
  return nodes.get(normalize(path));
}

function mkdirp(path) {
  path = normalize(path);
  if (nodes.has(path)) return nodes.get(path);

  const parent = mkdirp(dirname(path));
  const node = { type: 'dir', ino: nextIno++, mtime: Date.now(), children: new Set() };

  nodes.set(path, node);
  parent.children.add(basename(path));

  return node;
}

function writeFile(path, content) {
  path = normalize(path);

  const data = typeof content === 'string' ? encoder.encode(content) : content;
  const parent = mkdirp(dirname(path));
  let node = nodes.get(path);

  if (!node) {
    node = { type: 'file', ino: nextIno++, mtime: Date.now(), data };
    nodes.set(path, node);
    parent.children.add(basename(path));
  } else {
    node.data = data;
    node.mtime = Date.now();
  }
}

function removeNode(path) {
  path = normalize(path);
  nodes.delete(path);

  const parent = nodes.get(dirname(path));

  parent?.children.delete(basename(path));
}

function statOf(node) {
  const isDir = node.type === 'dir';
  const size = isDir ? 4096 : node.data.byteLength;

  return {
    dev: 1,
    ino: node.ino,
    mode: isDir ? S_IFDIR | 0o755 : S_IFREG | 0o644,
    nlink: 1,
    uid: 0,
    gid: 0,
    rdev: 0,
    size,
    blksize: 4096,
    blocks: Math.ceil(size / 512),
    atimeMs: node.mtime,
    mtimeMs: node.mtime,
    ctimeMs: node.mtime,
    isDirectory: () => isDir,
    isFile: () => !isDir,
  };
}

// File descriptors. 0, 1, and 2 are the process streams.
let nextFd = 3;
const fds = new Map();

// Standard streams.
const stdinQueue = [];
let stdinWaiter = null;
const stream = {
  onStdout: (bytes) => console.info(decoder.decode(bytes)),
  onStderr: (bytes) => console.error(decoder.decode(bytes)),
};

function pushStdin(bytes) {
  stdinQueue.push(bytes);

  if (stdinWaiter) {
    const waiter = stdinWaiter;

    stdinWaiter = null;
    waiter();
  }
}

function readStdin(buffer, offset, length, callback) {
  const serve = () => {
    const chunk = stdinQueue[0];
    const n = Math.min(length, chunk.byteLength);

    buffer.set(chunk.subarray(0, n), offset);

    if (n === chunk.byteLength) {
      stdinQueue.shift();
    } else {
      stdinQueue[0] = chunk.subarray(n);
    }

    callback(null, n);
  };

  if (stdinQueue.length > 0) {
    serve();
  } else {
    stdinWaiter = serve;
  }
}

const fs = {
  constants,

  writeSync(fd, buf) {
    if (fd === 1) stream.onStdout(buf.slice());
    else if (fd === 2) stream.onStderr(buf.slice());
    else throw makeError('EBADF');

    return buf.length;
  },

  write(fd, buffer, offset, length, position, callback) {
    if (fd === 1 || fd === 2) {
      const n = this.writeSync(fd, buffer.subarray(offset, offset + length));

      callback(null, n);

      return;
    }

    const entry = fds.get(fd);

    if (!entry || entry.node.type !== 'file') return callback(makeError('EBADF'));

    const node = entry.node;
    let at = position === null || position === undefined ? entry.pos : position;

    if (entry.flags & constants.O_APPEND) at = node.data.byteLength;

    const end = at + length;

    if (end > node.data.byteLength) {
      const grown = new Uint8Array(end);

      grown.set(node.data);
      node.data = grown;
    }

    node.data.set(buffer.subarray(offset, offset + length), at);
    node.mtime = Date.now();
    if (position === null || position === undefined) entry.pos = end;
    callback(null, length);
  },

  read(fd, buffer, offset, length, position, callback) {
    if (fd === 0) return readStdin(buffer, offset, length, callback);

    const entry = fds.get(fd);

    if (!entry) return callback(makeError('EBADF'));
    if (entry.node.type !== 'file') return callback(makeError('EISDIR'));

    const at = position === null || position === undefined ? entry.pos : position;
    const n = Math.max(0, Math.min(length, entry.node.data.byteLength - at));

    buffer.set(entry.node.data.subarray(at, at + n), offset);
    if (position === null || position === undefined) entry.pos += n;
    callback(null, n);
  },

  open(path, flags, mode, callback) {
    path = normalize(path);

    let node = nodes.get(path);

    if (flags & constants.O_CREAT) {
      if (node && flags & constants.O_EXCL) return callback(makeError('EEXIST'));

      if (!node) {
        if (!nodes.has(dirname(path))) return callback(makeError('ENOENT'));
        writeFile(path, new Uint8Array(0));
        node = nodes.get(path);
      }
    }

    if (!node) return callback(makeError('ENOENT'));
    if (flags & constants.O_DIRECTORY && node.type !== 'dir') return callback(makeError('ENOTDIR'));
    if (flags & constants.O_TRUNC && node.type === 'file') node.data = new Uint8Array(0);

    const fd = nextFd++;

    fds.set(fd, { path, node, pos: 0, flags });
    callback(null, fd);
  },

  close(fd, callback) {
    fds.delete(fd);
    callback(null);
  },

  fstat(fd, callback) {
    const entry = fds.get(fd);

    if (!entry) return callback(makeError('EBADF'));
    callback(null, statOf(entry.node));
  },

  stat(path, callback) {
    const node = get(path);

    if (!node) return callback(makeError('ENOENT'));
    callback(null, statOf(node));
  },

  lstat(path, callback) {
    this.stat(path, callback);
  },

  readdir(path, callback) {
    const node = get(path);

    if (!node) return callback(makeError('ENOENT'));
    if (node.type !== 'dir') return callback(makeError('ENOTDIR'));
    callback(null, Array.from(node.children));
  },

  mkdir(path, perm, callback) {
    path = normalize(path);
    if (nodes.has(path)) return callback(makeError('EEXIST'));

    const parent = nodes.get(dirname(path));

    if (!parent) return callback(makeError('ENOENT'));
    if (parent.type !== 'dir') return callback(makeError('ENOTDIR'));
    mkdirp(path);
    callback(null);
  },

  rmdir(path, callback) {
    const node = get(path);

    if (!node) return callback(makeError('ENOENT'));
    if (node.type !== 'dir') return callback(makeError('ENOTDIR'));
    if (node.children.size > 0) return callback(makeError('ENOTEMPTY'));
    removeNode(path);
    callback(null);
  },

  unlink(path, callback) {
    const node = get(path);

    if (!node) return callback(makeError('ENOENT'));
    if (node.type === 'dir') return callback(makeError('EISDIR'));
    removeNode(path);
    callback(null);
  },

  rename(from, to, callback) {
    const node = get(from);

    if (!node) return callback(makeError('ENOENT'));
    removeNode(from);
    to = normalize(to);
    mkdirp(dirname(to));
    nodes.set(to, node);
    nodes.get(dirname(to)).children.add(basename(to));
    callback(null);
  },

  readlink(path, callback) {
    callback(makeError(nodes.has(normalize(path)) ? 'EINVAL' : 'ENOENT'));
  },

  utimes(path, atime, mtime, callback) {
    const node = get(path);

    if (!node) return callback(makeError('ENOENT'));
    node.mtime = mtime * 1000;
    callback(null);
  },

  truncate(path, length, callback) {
    const node = get(path);

    if (!node) return callback(makeError('ENOENT'));
    node.data = node.data.slice(0, length);
    callback(null);
  },

  ftruncate(fd, length, callback) {
    const entry = fds.get(fd);

    if (!entry) return callback(makeError('EBADF'));
    entry.node.data = entry.node.data.slice(0, length);
    callback(null);
  },

  fsync(fd, callback) {
    callback(null);
  },

  chmod(path, mode, callback) {
    callback(null);
  },
  fchmod(fd, mode, callback) {
    callback(null);
  },
  chown(path, uid, gid, callback) {
    callback(null);
  },
  fchown(fd, uid, gid, callback) {
    callback(null);
  },
  lchown(path, uid, gid, callback) {
    callback(null);
  },
  link(path, link, callback) {
    callback(makeError('ENOSYS'));
  },
  symlink(path, link, callback) {
    callback(makeError('ENOSYS'));
  },
};

let cwd = '/';

globalThis.fs = fs;
globalThis.process = {
  getuid: () => 0,
  getgid: () => 0,
  geteuid: () => 0,
  getegid: () => 0,
  getgroups: () => [],
  pid: 1,
  ppid: 0,
  umask: () => 0o22,
  cwd: () => cwd,
  chdir: (dir) => {
    cwd = normalize(dir);
  },
};

globalThis.memfs = {
  writeFile,
  mkdirp,
  readFile: (path) => {
    const node = get(path);

    return node?.type === 'file' ? decoder.decode(node.data) : undefined;
  },
  exists: (path) => nodes.has(normalize(path)),
  pushStdin,
  stream,
};
