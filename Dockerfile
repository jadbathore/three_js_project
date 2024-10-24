FROM node:22

WORKDIR /usr/src/app

COPY ./package*.json ./

RUN npm install 

COPY ./app ./app

COPY rollup.config.js ./

COPY tsconfig.json ./

EXPOSE 3000