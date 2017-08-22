#!/usr/bin/env bash

# unit tests
ts-node test/test.ts || exit 1

# compile failing tests
for f in $(ls test/failing/*.ts)
do
    ts-node $f > /dev/null 2>&1
    if [ "$?" -eq "0" ]; then
        echo "$f should fail"
        exit 1
    fi
done
