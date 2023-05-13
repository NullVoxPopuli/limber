#!/bin/bash


REPO_LOCATION="../../../glimdown"

GLIMDOWN_PATH="$REPO_LOCATION/packages/codemirror/glimdown"
GJS_PATH="$REPO_LOCATION/packages/codemirror/glimmer-js"
GLIMMER_PATH="$REPO_LOCATION/packages/codemirror/glimmer"

pnpm link $GLIMDOWN_PATH 
pnpm link $GLIMMER_PATH 
pnpm link $GJS_PATH 
