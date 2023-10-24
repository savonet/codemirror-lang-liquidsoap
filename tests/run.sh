#!/bin/sh

set -e

PWD=$(dirname "$0")
BASE_DIR=$(cd "${PWD}/.." && pwd)

npm run build

cd "${BASE_DIR}/tests"
rm -rf liquidsoap
git clone --depth=1 https://github.com/savonet/liquidsoap.git

# This file has a unicode variable that is not supported for now.
rm -rf liquidsoap/src/libs/list.liq

cd "${BASE_DIR}"
npm exec liquidsoap-lezer-print-tree -- -q tests/liquidsoap/src/**/*.liq tests/liquidsoap/tests/**/*.liq
