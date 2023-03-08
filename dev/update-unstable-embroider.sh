#!/bin/bash

branch="preview-embroider-upgrade"

# Just in case you have a branch with the same name
git branch -D $branch
git switch -c $branch

# Updates package.json
pnpm dev use-unstable-embroider

pnpm install --fix-lockfile

./dev/bot-push.sh $branch
