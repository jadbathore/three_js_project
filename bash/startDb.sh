#!/bin/bash

startDb(){
    mongod --config /opt/homebrew/etc/mongod.conf --fork
}
startDb

