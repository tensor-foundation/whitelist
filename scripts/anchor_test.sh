#!/bin/bash
set -e

TESTS_GLOB=${TESTS_GLOB:-"tests/**/*.ts"}

# parallel mode, doesn't work b/c:
# (1) we can't check fee vault in parallel, b/c
# (2) we're limited to 1 TSwap, b/c
# (3) cfg_attr does not work with account(init) apparently...
# yarn run ts-mocha --parallel --jobs 100 ./tsconfig.json -t 100000 "$TESTS_GLOB"
# Need 200s timeout b/c sell a ton test takes ~100s
yarn run ts-mocha -p ./tsconfig.json -t 200000 "$TESTS_GLOB"