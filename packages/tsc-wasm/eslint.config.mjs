import { configs } from "@nullvoxpopuli/eslint-configs";

// eslint-disable-next-line n/no-unsupported-features/node-builtins
export default [{ ignores: ["wasm_exec.js", "dist/"] }, ...configs.node(import.meta.dirname)];
