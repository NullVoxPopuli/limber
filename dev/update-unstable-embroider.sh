#!/bin/bash
#
# set -e -- exit when any command fails
# set +e -- do not exit when any command fails

branch="preview-embroider-upgrade"

set +e
# Switch to a non-default and non-current branch in case:
# - something goes wrong an you are on the main branch 
# - something goes wrong and you are on the embroider test branch
git branch -D tmp
set -e
git switch -c tmp

# Just in case you have a branch with the same name
set +e
git branch -D $branch
set -e
git switch -c $branch

# Updates package.json
pnpm dev use-unstable-embroider

pnpm install --fix-lockfile

./dev/bot-push.sh $branch
