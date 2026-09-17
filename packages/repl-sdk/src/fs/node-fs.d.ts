import type { Storage } from './storage.js';

type Callback = (error: null | Error, ...results: unknown[]) => void;

/**
 * What Go's wasm runtime calls through `globalThis.fs`.
 */
export interface GoFs {
  constants: {
    O_WRONLY: number;
    O_RDWR: number;
    O_CREAT: number;
    O_EXCL: number;
    O_TRUNC: number;
    O_APPEND: number;
    O_DIRECTORY: number;
  };
  writeSync(fd: number, buffer: Uint8Array): number;
  write(
    fd: number,
    buffer: Uint8Array,
    offset: number,
    length: number,
    position: null | number,
    callback: Callback
  ): void;
  read(
    fd: number,
    buffer: Uint8Array,
    offset: number,
    length: number,
    position: null | number,
    callback: Callback
  ): void;
  open(path: string, flags: number, mode: number, callback: Callback): void;
  close(fd: number, callback: Callback): void;
  fstat(fd: number, callback: Callback): void;
  stat(path: string, callback: Callback): void;
  lstat(path: string, callback: Callback): void;
  readdir(path: string, callback: Callback): void;
  readlink(path: string, callback: Callback): void;
  [syscall: string]: unknown;
}

export interface GoProcess {
  getuid(): number;
  getgid(): number;
  geteuid(): number;
  getegid(): number;
  getgroups(): number[];
  pid: number;
  ppid: number;
  umask(): number;
  cwd(): string;
  chdir(dir: string): void;
}

export interface NodeFs {
  fs: GoFs;
  process: GoProcess;

  /**
   * Bytes for the Go program's stdin.
   */
  pushStdin(bytes: Uint8Array): void;

  /**
   * A file the Go program sees that is not in storage, or a newer version of
   * one that is.
   */
  overlay(path: string, text: string): void;

  /**
   * Storage changed underneath. Forget what it said.
   */
  invalidate(): void;
}

/**
 * The storage, served the way Go's wasm runtime reads files.
 * Reads only; stdout and stderr call back to the host.
 */
export function nodeFs(
  storage: Storage,
  streams?: {
    onStdout?: (bytes: Uint8Array) => void;
    onStderr?: (bytes: Uint8Array) => void;
  }
): NodeFs;
