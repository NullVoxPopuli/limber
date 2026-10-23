// Builds dist/tsc.wasm from the pinned TypeScript commit.
//
// Needs git and Go on PATH. The commit lives on a fork until the
// js/wasm spawn bridge is upstream.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(here, "package.json"), "utf8"));
const { typescriptRepository, typescriptCommit } = manifest.config;

const dist = join(here, "dist");
const wasm = join(dist, "tsc.wasm");
const stamp = join(dist, "commit");

function run(command, args, options = {}) {
  console.info(`> ${command} ${args.join(" ")}`);

  return execFileSync(command, args, { stdio: "inherit", ...options });
}

function isBuilt() {
  return (
    existsSync(wasm) && existsSync(stamp) && readFileSync(stamp, "utf8").trim() === typescriptCommit
  );
}

if (isBuilt()) {
  console.info(`dist/tsc.wasm is already built from ${typescriptCommit}`);
} else {
  build();
}

function build() {
  const checkout = join(
    process.env.TSC_WASM_CHECKOUT ?? tmpdir(),
    `typescript-${typescriptCommit.slice(0, 12)}`,
  );

  if (!existsSync(join(checkout, "tsc", "go.mod"))) {
    rmSync(checkout, { recursive: true, force: true });
    mkdirSync(checkout, { recursive: true });
    run("git", ["init", "-q"], { cwd: checkout });
    run("git", ["fetch", "-q", "--depth", "1", typescriptRepository, typescriptCommit], {
      cwd: checkout,
    });
    run("git", ["checkout", "-q", "FETCH_HEAD"], { cwd: checkout });
  }

  mkdirSync(dist, { recursive: true });

  run("go", ["build", "-trimpath", "-ldflags=-s -w", "-o", wasm, "./cmd/tsc"], {
    cwd: join(checkout, "tsc"),
    env: { ...process.env, GOOS: "js", GOARCH: "wasm", CGO_ENABLED: "0" },
  });

  writeFileSync(stamp, `${typescriptCommit}\n`);

  const megabytes = (statSync(wasm).size / 1024 / 1024).toFixed(1);

  console.info(`built dist/tsc.wasm (${megabytes} MB) from ${typescriptCommit}`);
}
