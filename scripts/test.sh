#!/bin/bash

notaDirectory='./'
pwd

cd $notaDirectory


export NODE_ENV=test
echo "NODE_ENV is: "$NODE_ENV
export DATABASEURI=mongodb://localhost/nota-test
echo "Mongodb database URI is: "$DATABASEURI

# runs unit tests and coverage
./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha --report lcov -- -R spec && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage
