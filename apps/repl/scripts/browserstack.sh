#!/bin/bash

function cleanup()
{
  pnpm ember browserstack:disconnect
}

trap cleanup EXIT
trap cleanup SIGINT

pnpm ember build --environment=development
pnpm ember browserstack:connect
pnpm ember test --path ./dist --test-port=7774 --host 127.0.0.1 --config-file=browserstack.testem.js
pnpm ember browserstack:results

