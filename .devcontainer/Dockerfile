FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    jq \
  && npm install -g typescript@latest \
  && rm -rf /var/lib/apt/lists/*
