#!/bin/bash

function cleanup()
{
  pnpm ember browserstack:disconnect
}

trap cleanup EXIT
trap cleanup SIGINT

pnpm vite build --mode test
pnpm ember browserstack:connect
pnpm ember test --path ./dist --test-port=7774 --host 127.0.0.1 --config-file=browserstack.testem.cjs
pnpm ember browserstack:results

