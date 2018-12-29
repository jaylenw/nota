FROM ubuntu:16.04

RUN apt update -y && apt full-upgrade -y && apt install curl -y && \
    curl -sL https://deb.nodesource.com/setup_6.x | bash - && \
    apt install nodejs -y;

COPY . /app

WORKDIR /app

RUN npm install;

CMD ./scripts/test.sh
