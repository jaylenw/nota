#!/bin/bash

notaDirectory='./'
pwd

cd $notaDirectory

export NODE_ENV=production
echo "NODE_ENV is: "$NODE_ENV
export DATABASEURI=mongodb://localhost/nota
echo "Mongodb database URI is: "$DATABASEURI

forever start bin/www
# node bin/www # local production testing
