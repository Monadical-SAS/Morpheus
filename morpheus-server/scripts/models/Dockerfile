FROM monadicalsas/morpheus-data:latest as lib
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
RUN apt-get update && apt-get install -y jq build-essential curl python3-dev libpq-dev python3-pip python3-venv && rm -rf /var/lib/apt/lists/*

WORKDIR "$API_ROOT"

RUN pip3 install virtualenv && \
    virtualenv "/opt/$VENV_NAME"
ENV PATH="/opt/$VENV_NAME/bin:${PATH}"
RUN dir -s

# Install rust for some wheel building processes
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install & use pipenv
RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install torch==1.13.1 && pip install -r requirements.txt

# Find the latest wheel file of morpheus_data in the /wheels directory and install it
COPY --from=lib /wheels /wheels
RUN latest_wheel=$(ls -1 /wheels/*.whl | sort -V | tail -n 1) && \
    pip install $latest_wheel

COPY . .
ENTRYPOINT ["python", "scripts/models/cli.py"]
