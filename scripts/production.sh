#!/bin/bash

notaDirectory='./'
pwd

cd $notaDirectory

export NODE_ENV=production
echo "NODE_ENV is: "$NODE_ENV
export DATABASEURI=mongodb://$dbUsername:$dbPassword@localhost/nota
echo "Mongodb database URI is: "$DATABASEURI

forever start bin/www
