#!/bin/bash

notaDirectory='./'
pwd

cd $notaDirectory

export NODE_ENV=test

echo "NODE_ENV is:"
echo $NODE_ENV

# runs unit tests and coverage
./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha --report lcov -- -R spec && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage
