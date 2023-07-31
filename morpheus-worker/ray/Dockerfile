FROM rayproject/ray:latest-gpu

# Configuration defaults
ENV VENV_NAME ".venv-docker"

# Setup system environment variables neded for python to run smoothly
ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8
ENV PYTHONDONTWRITEBYTECODE 1

ENV PYTHONUNBUFFERED 1

# Install system requirements
RUN sudo apt-get update && sudo apt-get install -y jq build-essential libpq-dev && sudo rm -rf /var/lib/apt/lists/*

# Install & use pipenv
RUN pip install --upgrade pip pipenv
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY models.py .
COPY models.yaml .
