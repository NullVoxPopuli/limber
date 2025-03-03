// eslint.config.js
import { configs } from "@nullvoxpopuli/eslint-configs";

// accommodates: JS, TS, App, Addon, and V2 Addon
export default configs.ember(import.meta.dirname);
