#!/bin/bash

notaDirectory='./'
pwd

cd $notaDirectory

export NODE_ENV=development
echo "NODE_ENV is: "$NODE_ENV
# using the mongo service the docker compose network provides
export DATABASEURI=mongodb://mongo/nota-dev
echo "Mongodb database URI is: "$DATABASEURI

node bin/www # local development testing
