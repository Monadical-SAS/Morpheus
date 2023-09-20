ARG BUILD_ENV="copy"
FROM debian:latest as base

ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8
ENV NODE_MAJOR=18

ENV CLIENT_ROOT "/app"

# Install system requirements
RUN apt-get update && apt-get install -y \
    curl ca-certificates curl gnupg && \
    rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update && apt-get install nodejs -y

RUN npm install --global npm yarn next sass

WORKDIR ${CLIENT_ROOT}

FROM base as build_copy
ONBUILD COPY . .
ONBUILD RUN yarn install && yarn build

FROM base as build_no_copy
ONBUILD RUN echo "No copy ..."

FROM build_$BUILD_ENV