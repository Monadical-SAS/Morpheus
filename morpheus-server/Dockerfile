ARG BUILD_ENV="no_copy"
ARG TAG="latest"
FROM monadicalsas/morpheus-data:${TAG} as lib
FROM nvidia/cuda:11.7.1-base-ubuntu22.04 as base

# Configuration defaults
ENV API_ROOT "/opt/api"
ENV HTTP_PORT "5000"
ENV API_USER "www-data"
ARG USER_ID="1000"
ENV API_USER_ID "${USER_ID}"
ENV VENV_NAME ".venv-docker"

# Setup system environment variables neded for python to run smoothly
ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8
ENV PYTHONDONTWRITEBYTECODE 1

ENV PYTHONUNBUFFERED 1

# Install system requirements
RUN apt-get update && apt-get install -y jq build-essential curl python3-dev libpq-dev python3-pip python3-venv && rm -rf /var/lib/apt/lists/*

WORKDIR "$API_ROOT"

RUN pip3 install virtualenv && \
    virtualenv "/opt/$VENV_NAME"
ENV PATH="/opt/$VENV_NAME/bin:${PATH}"

# Install rust for some wheel building processes
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install dependencies
RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install torch==1.13.1 && pip install -r requirements.txt --no-cache-dir

# Find the latest wheel file of morpheus-data in the /wheels directory and install it
COPY --from=lib /wheels /wheels
RUN latest_wheel=$(ls -1 /wheels/*.whl | sort -V | tail -n 1) && \
    pip install $latest_wheel

# Create api user
RUN userdel "$API_USER" && addgroup --system --gid "$API_USER_ID" "$API_USER" && \
    adduser --system --uid "$API_USER_ID" --ingroup "$API_USER" --shell /bin/false "$API_USER"

FROM base as build_copy
ONBUILD COPY . .

FROM base as build_no_copy
ONBUILD RUN echo "No copy ..."

FROM build_$BUILD_ENV
RUN chown -R "$API_USER_ID":"$API_USER_ID" "$API_ROOT"
USER "$API_USER"
