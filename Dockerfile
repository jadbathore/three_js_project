FROM node:22
WORKDIR /usr/src/bin
COPY ./package*.json ./
RUN npm install 
COPY ./bin ./bin
COPY ./app ./app
COPY ./_types ./_types
COPY threeTree.config.js ./
COPY rollup.config.js ./
RUN echo '#!/bin/bash'> /usr/local/bin/t && \
echo 'if [$# -eq 0]; then '>> /usr/local/bin/t && \
echo '\tnode ./bin/index.js '>> /usr/local/bin/t && \
echo '\texit 1'>> /usr/local/bin/t && \
echo 'fi'>> /usr/local/bin/t && \
echo 'args=""'>> /usr/local/bin/t && \
echo 'for arg in "$@";do'>> /usr/local/bin/t && \
echo '\targs="$args $arg"'>> /usr/local/bin/t && \
echo 'done'>> /usr/local/bin/t && \
echo 'node ./bin/index.js $args'>> /usr/local/bin/t && \
chmod 777 /usr/local/bin/t

CMD ["./bash/bin.sh"]

CMD ["tail", "-f", "/dev/null"]


# ENTRYPOINT ["/s"]