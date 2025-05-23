#!/bin/bash
if [$# -eq 0]; then 
    node ./bin/index.js
    exit 1
fi
args=""
for arg in "$@";do
    args="$args $arg"
done 

node ./bin/index.js $args