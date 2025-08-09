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
if [[ -v LOCAL ]]; then
  if [[ "$LOCAL" == "1" ]]; then
    relative="Development/OpenSource/build-start-rebuild-perf/bin/cli.js"
    LOCAL="$HOME/$relative"
    echo "Using default location of ~/$relative"
  fi

	node $LOCAL \
		--file ./app/app.js \
		--wait-for "main header nav" \
		--url "https://localhost:4201/" \
		--log-level log
else
	# Docs: https://github.com/mainmatter/build-start-rebuild-perf
	pnpm dlx build-start-rebuild-perf \
		--file ./app/app.js \
		--wait-for "main header nav" \
		--url "https://localhost:4201/" \
		--log-level log
fi
