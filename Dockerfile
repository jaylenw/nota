# This dockerfile will use multistage builds
# We will create a deployment stage that we will use to generate an image from
# to deploy via docker build --target deployment -t notaorg/nota-dev .
# We are doing it this way because of how travis needs to get the exit code
# from the tests. This will ensure that we only publish the deployment image
# when tests have passed

# create deployment stage
FROM notaorg/nota-ubuntu-16.04:latest AS deployment

RUN apt install curl -y && \
    curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt install nodejs -y && apt autoclean -y;

# Change user away from root, set an arbitrary uid
#USER 9000

# create user and user group
RUN addgroup --system backEndUserGroup && \
    adduser --disabled-password --gecos '' backenduser && \
    mkdir /home/backenduser/app

COPY . /home/backenduser/app

WORKDIR /home/backenduser/app

RUN chown -R backenduser:backEndUserGroup /home/backenduser

# switch away from root user and run as backenduser
USER backenduser

# only install production dependencies
RUN npm install --save-prod;

# from deployment stage of the build, create test stage and this will be the final
# image for this dockerfile build
FROM deployment as test

WORKDIR /home/backenduser/app

# copy the workdir from the deployment stage to this stage
COPY --from=deployment /home/backenduser/app .

# install all dependencies
RUN npm install

# Runs unit / continuous integration tests
CMD ./scripts/test.sh
#CMD /bin/bash
