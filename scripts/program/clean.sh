#!/bin/bash

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
OUTPUT="./target/external"
# go to parent folder
cd $(dirname $(dirname ${SCRIPT_DIR}))

rm -rf $OUTPUT

if [ -z ${PROGRAMS+x} ]; then
    PROGRAMS="$(cat .github/.env | grep "PROGRAMS" | cut -d '=' -f 2)"
fi

PROGRAMS=$(echo ${PROGRAMS} | jq -c '.[]' | sed 's/"//g')
WORKING_DIR=$(pwd)

for p in ${PROGRAMS[@]}; do
    cd ${WORKING_DIR}/${p}
    rm -rf target
done