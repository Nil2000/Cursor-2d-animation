FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    build-essential \
    && apt-get install -y docker-ce-cli \
    && rm -rf /var/lib/apt/lists/*