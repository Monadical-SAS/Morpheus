ARG BUILD_ENV="copy"
FROM node:20-slim as base

ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8

ENV CLIENT_ROOT "/app"

RUN npm install --global next sass

WORKDIR ${CLIENT_ROOT}

FROM base as build_copy
ONBUILD COPY . .
ONBUILD RUN yarn install && yarn build

FROM base as build_no_copy
ONBUILD RUN echo "No copy ..."

FROM build_$BUILD_ENV