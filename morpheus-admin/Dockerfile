ARG BUILD_ENV="copy"
FROM debian:latest as base

ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8

ENV CLIENT_ROOT "/app"

# Install system requirements
RUN apt-get update && apt-get install -y \
    curl && \
    rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && apt-get install -y nodejs npm

RUN npm install --global npm && npm install --global yarn && npm install --global next sass

WORKDIR ${CLIENT_ROOT}

FROM base as build_copy
ONBUILD COPY . .
ONBUILD RUN yarn install && yarn build

FROM base as build_no_copy
ONBUILD RUN echo "No copy ..."

FROM build_$BUILD_ENV
