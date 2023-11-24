FROM python:3.10 AS builder

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y curl build-essential && rm -rf /var/lib/apt/lists/*

# Install dependencies
RUN pip install --upgrade pip
RUN pip install --upgrade build pip-tools

# Copy over pyproject.toml
COPY pyproject.toml ./

# Generate requirements.txt from pyproject.toml
RUN pip-compile --output-file=requirements.txt pyproject.toml

# Install dependencies
RUN pip install -r requirements.txt

# Copy over the rest of your project files
COPY . .

# Build the wheel
RUN python -m build --wheel && mkdir /wheels

# Copy the built wheel to a volume
RUN cp dist/*.whl /wheels/