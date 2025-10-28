FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    jq \
  && rm -rf /var/lib/apt/lists/*
