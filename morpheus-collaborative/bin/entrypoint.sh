#!/bin/bash

set -e
if [ "prod" == "$ENVIRONMENT" ]; then
    yarn start
else
    yarn install
    yarn start:dev
fi    
