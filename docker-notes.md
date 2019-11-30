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
