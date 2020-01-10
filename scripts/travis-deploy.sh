#!/bin/bash

# save the environment value to what was passed in
environment=$1
commit_hash="$(git rev-parse --short HEAD)"

if [[ $environment = "dev" || $environment = "prod" ]]; then
  # build images for deployment from the deployment stage, one with commit hash and the other with "latest"
  sudo docker build --target deployment -t notaorg/nota-$environment:$commit_hash -t notaorg/nota-$environment:latest .
  echo "Docker build completed with exit status of "$?
  # login to docker hub
  echo $DOCKER_ACCESS_TOKEN | sudo docker login --username $DOCKER_USERNAME --password-stdin
  echo "Docker login completed with exit status of "$?
  # push and tag with first 7 characters of current commit
  sudo docker push notaorg/nota-$environment:$commit_hash
  # store the last command's status code
  push_command_status=$?
  if [[ $push_command_status -ne 0 ]]; then
    # exit the script with non-zero exit status code as one of the docker commands above failed
    echo "Docker failed to push the first image with status code of "$push_command_status
    exit $push_command_status
  fi
  # push and tag with "latest"
  sudo docker push notaorg/nota-$environment:latest
  # store the last command's status code
  push_command_status=$?
  echo "Docker push to registry for the $environment environment with two tags completed with exit status of "$push_command_status
  exit $push_command_status # return status code of the push command
else
  echo "Invalid environment string passed. Either 'dev' or 'prod'."
  exit 1; # exit w/ 1 to indicate non successful execution of the script
fi
