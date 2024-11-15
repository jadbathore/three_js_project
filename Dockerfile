FROM node:22
WORKDIR /usr/src/bin
COPY ./package*.json ./
RUN npm install 
COPY ./bin ./bin
COPY ./app ./app
COPY threeTree.config.js ./


CMD ["tail", "-f", "/dev/null"]

