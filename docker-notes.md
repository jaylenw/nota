### Docker image "ubuntu16.04-updated"

#### Builds the Docker image we use to build our Nota and MongoDB images

`docker build -f Dockerfile-base . -t "ubuntu16.04-updated" --no-cache`

#### Tags the image

`docker tag ubuntu16.04-updated notaorg/nota-ubuntu-16.04:latest`

#### Pushes the image to Docker Hub

`docker push notaorg/nota-ubuntu-16.04:latest`

### Build and tag an image from a particular stage

`docker build --target deployment -t notaorg/nota-dev:latest .`

### Run the deployed image with a command to start the application

`docker run <image-id> node bin/www`

### Enter interactive mode with bash with docker-compose

`sudo docker-compose run <service-name> bash`

### Enter interactive mode with bash with docker-compose*

Run as the user id specified and mount a volume of our project to the working
directory of the container so that we make edits to the files in the container
or on the host. Note that in our `docker-compose.yml` file, we put a "depends link"
for Nota to require the MongoDB container to start (before Nota). This way we don't
need to specify the MongoDB container to start when we run the command below.

`docker-compose run --user="$(id -u)" --service-ports -v $(pwd):/home/backenduser/app nota bash`
