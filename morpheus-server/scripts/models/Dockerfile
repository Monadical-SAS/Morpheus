FROM python:3.10-slim

# Configuration defaults
ENV API_ROOT "/opt/api"
ENV VENV_NAME ".venv-docker"


# Setup system environment variables neded for python to run smoothly
ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8
ENV PYTHONDONTWRITEBYTECODE 1

ENV PYTHONUNBUFFERED 1

# Install system requirements
RUN apt-get update && apt-get install -y jq build-essential python3-dev libpq-dev python3-pip python3-venv && rm -rf /var/lib/apt/lists/*

WORKDIR "$API_ROOT"

RUN pip3 install virtualenv && \
    virtualenv "/opt/$VENV_NAME"
ENV PATH="/opt/$VENV_NAME/bin:${PATH}"
RUN dir -s

# Install & use pipenv
RUN pip install --upgrade pip pipenv
COPY Pipfile.lock .
RUN pip install torch==1.13.1 && jq -r '.default,.develop | to_entries[] | .key + .value.version' "./Pipfile.lock" | \
    pip install --no-cache-dir -r /dev/stdin && rm ./Pipfile.lock
COPY . .
ENTRYPOINT ["python", "scripts/models/cli.py"]
