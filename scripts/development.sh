#!/bin/bash

notaDirectory='./'
pwd

cd $notaDirectory

export NODE_ENV=development
echo "NODE_ENV is: "$NODE_ENV
export DATABASEURI=mongodb://localhost/nota-dev
echo "Mongodb database URI is: "$DATABASEURI

node bin/www # local development testing
