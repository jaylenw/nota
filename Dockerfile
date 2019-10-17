FROM ubuntu16.04-updated

RUN apt install curl -y && \
    curl -sL https://deb.nodesource.com/setup_6.x | bash - && \
    apt install nodejs -y;

COPY . /app

WORKDIR /app

RUN npm ci;

CMD ./scripts/test.sh
