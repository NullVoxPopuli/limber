# @nullvoxpopuli/tsc-wasm

TypeScript 7 compiled to WebAssembly.

The package ships two files:

- `dist/tsc.wasm`: the TypeScript compiler and language server, built for Go's `js/wasm` target. About 49 MB, 11 MB over the wire.
- `wasm_exec.js`: Go's JavaScript runtime shim, copied from the Go distribution.

## Use

Load the shim in a worker, then run the language server over stdio:

```js
import "@nullvoxpopuli/tsc-wasm/wasm_exec.js";

const go = new Go();
go.argv = ["tsc", "--lsp", "--stdio"];

const { instance } = await WebAssembly.instantiateStreaming(fetch(wasmUrl), go.importObject);
await go.run(instance);
```

The Go runtime reads files, stdin, and stdout through `globalThis.fs`, so the worker must provide an
in-memory file system before it loads the shim.

Content mappers run through `globalThis.tsc.spawn(command, dir, onData, onExit)`. The host returns
`{ write(bytes), close() }` and delivers the mapper's output through `onData`. Both sides use the
LSP base protocol framing.

## Build

```sh
pnpm build
```

The script fetches the pinned commit named in `package.json` under `config`, builds it with Go, and
writes `dist/tsc.wasm`. It needs git and Go on PATH; Go downloads the toolchain version the
module asks for. The commit lives on a fork of microsoft/TypeScript until the `js/wasm` spawn
bridge is upstream.

## License

TypeScript is licensed under Apache-2.0. `wasm_exec.js` is licensed under the Go BSD license.
