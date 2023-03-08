#!/bin/bash
#
# set -e exits the script if any command returns a non-zero exit code
# set -x prints the commands as they are executed
set -ex

echo "nukin' node_modules & declaration directories" 

find . -name 'node_modules' -type d -prune -exec rm -rf {} +
find . -name 'declarations' -type d -prune -exec rm -rf {}  +
find . -name 'dist' -type d -prune -exec rm -rf {} + 
find . -name '.turbo' -type d -prune -exec rm -rf {} +
 
pnpm install --ignore-scripts
