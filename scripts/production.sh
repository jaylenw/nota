#!/bin/bash

notaDirectory='./'
pwd

cd $notaDirectory

export NODE_ENV=production

echo "NODE_ENV is:"
echo $NODE_ENV

forever start bin/www
