#!/bin/bash

notaDirectory='./'
pwd

cd $notaDirectory


export NODE_ENV=test
echo "NODE_ENV is: "$NODE_ENV
echo "Mongodb database URI is: "$DATABASEURI

# runs unit tests and coverage
./node_modules/nyc/bin/nyc.js ./node_modules/mocha/bin/_mocha && ./node_modules/nyc/bin/nyc.js report --reporter=text-lcov | ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage
