#!/bin/sh

# On my test system, I didn't feel like setting up docker
# docker run \
#   --env-file=.env.turbo \
#   -p 3000:13000 \
#   fox1t/turborepo-remote-cache
#
# We must provide a shell script to pm2,
# because pm2 doesn't fallback to trying shell eecution
# when the script doesn't happen to be js.
#
# maybe there are better daemon tools than pm2 out there.

(\
  set -a \
  && . ./.env.turbo \
  && ./node_modules/.bin/turborepo-remote-cache \
)
