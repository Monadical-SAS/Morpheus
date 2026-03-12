# The base-deps Docker image installs main libraries needed to run Ray

# The GPU options are NVIDIA CUDA developer images.
ARG BASE_IMAGE="monadicalsas/morpheus-worker:base"
FROM ${BASE_IMAGE}
# FROM directive resets ARG
ARG BASE_IMAGE

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install torch
RUN pip install -r requirements.txt
# accelerate 1.x has a circular import bug; pin to last pre-1.0 release
# pyopenssl>=23.0.0 required for compatibility with cryptography>=40 pulled by google-auth
RUN pip install "accelerate==0.34.2" google-cloud-storage google-auth "pyopenssl>=23.0.0"

WORKDIR /opt

# Copy the application files
COPY app app
COPY ./bin/start.sh .
COPY models.yaml .
