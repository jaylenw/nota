FROM notaorg/nota-ubuntu-16.04:latest

RUN apt install curl -y && \
    curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
    apt install nodejs -y && apt autoclean -y;

COPY . /app

WORKDIR /app

RUN npm install;

CMD ./scripts/test.sh
#CMD /bin/bash
