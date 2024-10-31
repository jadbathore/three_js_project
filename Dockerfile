FROM node:22
WORKDIR /usr/src/bin
COPY ./package*.json ./
RUN npm install 
COPY ./bin ./bin
COPY ./app ./app


CMD ["node"]
# CMD ["ThreeCli","node bin/index.js"]
