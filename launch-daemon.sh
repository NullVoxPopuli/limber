#!/bin/sh

# can also be ran without docker
# as the original project is written
# in typescript
# - node
# - Fastify: https://www.fastify.io/

# On my test system, I didn't feel like setting up docker
# docker run \
#   --env-file=.env.turbo \
#   -p 3000:13000 \
#   fox1t/turborepo-remote-cache

# This runs directly from a git clone (node)
# Before running this,
#  - clone the repo
#  - npm install
#  - npm run prebuild
#  - npm run build
(\
  set -a \
  && . ./.env.turbo \
  && ( cd ../turborepo-remote-cache && npm run start ) \
)
