# The base-deps Docker image installs main libraries needed to run Ray

# The GPU options are NVIDIA CUDA developer images.
ARG BASE_IMAGE="monadicalsas/morpheus-worker:base"
FROM ${BASE_IMAGE}
# FROM directive resets ARG
ARG BASE_IMAGE

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install torch
RUN pip install kaolin==0.15.0 -f https://nvidia-kaolin.s3.us-east-2.amazonaws.com/torch-2.1.1_cu121.html
RUN pip install -r requirements.txt

WORKDIR /opt

# Copy the application files
COPY app app
COPY ./bin/start.sh .
COPY models.yaml .
