import assert from "node:assert";
import { join } from "node:path";
import fs from "node:fs/promises";
import url from "node:url";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const [, , ...args] = process.argv;

const isInit = args.includes("init");

assert(isInit, `unknown command, only allowed: 'init'`);

const swDir = join(__dirname, "..", "dist-sw");

const target = join(process.cwd(), "public");
await fs.copyFile(join(swDir, "sw.js"), join(target, "sw.js"));
await fs.copyFile(join(swDir, "sw.js.map"), join(target, "sw.js.map"));
