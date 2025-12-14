#!/usr/bin/env bash

echo "Measuring build perf of $(basename $PWD)"

# Set LOCAL=./to/wherever/you/cloned/the/perf/code/locally
#
# Example
#
#   LOCAL=~/Development/OpenSource/build-start-rebuild-perf/bin/cli.js ./perf-check.sh
#
#   or
#
#   Local=1 ./perf-check.sh
#
#
#  (Setting to 1 means use this exact path)

TOOL="pnpm dlx build-start-rebuild-perf"

if [[ -v LOCAL ]]; then
  if [[ "$LOCAL" == "1" ]]; then
    relative="Development/OpenSource/build-start-rebuild-perf/bin/cli.js"
    LOCAL="$HOME/$relative"
    echo "Using default location of ~/$relative"
  fi

  TOOL="node $LOCAL"
fi

port="41137"

common_args="
  --timeout 180000 \
  --file ./app/app.ts \
  --wait-for 'main header nav' \
  --url 'https://localhost:$port/' \
  $@
"


with_force="
  $TOOL \
    --command 'pnpm vite --force --port $port' \
    $common_args
"

warm="
  $TOOL \
    --command 'pnpm vite --port $port' \
    $common_args
"

echo "No Cache"

echo "Running:"
echo -e "$with_force"
eval $with_force

echo "Warm"

echo "Running:"
echo -e "$warm"
eval $warm
