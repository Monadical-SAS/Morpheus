ARG RAY_IMAGE_TAG="latest-gpu"
FROM rayproject/ray:$RAY_IMAGE_TAG

# Configuration defaults
ENV VENV_NAME ".venv-docker"

# Setup system environment variables neded for python to run smoothly
ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8
ENV PYTHONDONTWRITEBYTECODE 1

ENV PYTHONUNBUFFERED 1

# Install system requirements
RUN sudo apt-get update && sudo apt-get install -y jq build-essential libpq-dev && sudo rm -rf /var/lib/apt/lists/*

# Install python requirements
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install torch
RUN pip install -r requirements.txt

# Copy the application files
COPY app app
COPY models.yaml .
