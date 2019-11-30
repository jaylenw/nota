#!/bin/bash

# save the environment value to what was passed in
environment=$1

if [[ $environment = "dev" || $environment = "prod" ]]; then
  # build an image for deployment from the deployment stage
  sudo docker build --target deployment -t notaorg/nota-$environment:latest .
  echo "Docker build completed with exit status of "$?
  # login to docker hub
  echo $DOCKER_ACCESS_TOKEN | sudo docker login --username $DOCKER_USERNAME --password-stdin
  echo "Docker login completed with exit status of "$?
  # push and tag with first 7 characters of current commit
  docker push notaorg/nota-$environment:"$(git rev-parse --short HEAD)"
  echo "Docker push to registry for the $environment environment completed with exit status of "$?
  exit # leave exit blank to return the exit code of last ran cmd
else
  echo "Invalid environment string passed. Either 'dev' or 'prod'."
  exit 1; # exit w/ 1 to indicate non successful execution of the script
fi
