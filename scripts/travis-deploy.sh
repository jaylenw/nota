#!/bin/bash

# save the environment value to what was passed in
environment=$1
commit_hash="$(git rev-parse --short HEAD)"

if [[ $environment = "dev" || $environment = "prod" ]]; then
  # build an image for deployment from the deployment stage
  sudo docker build --target deployment -t notaorg/nota-$environment:$commit_hash .
  echo "Docker build completed with exit status of "$?
  # login to docker hub
  echo $DOCKER_ACCESS_TOKEN | sudo docker login --username $DOCKER_USERNAME --password-stdin
  echo "Docker login completed with exit status of "$?
  # push and tag with first 7 characters of current commit
  sudo docker push notaorg/nota-$environment:$commit_hash
  # store the last command's status code
  push_command_status=$?
  echo "Docker push to registry for the $environment environment completed with exit status of "$push_command_status
  exit $push_command_status # return status code of the push command
else
  echo "Invalid environment string passed. Either 'dev' or 'prod'."
  exit 1; # exit w/ 1 to indicate non successful execution of the script
fi
