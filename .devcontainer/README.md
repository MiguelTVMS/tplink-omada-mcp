# Devcontainer usage

The repository ships with a devcontainer configuration tailored for working on the Omada MCP server. The development container is based on the official TypeScript/Node.js image and launches a sidecar TP-Link Omada controller using the [`mbentley/omada-controller`](https://hub.docker.com/r/mbentley/omada-controller) image.

## Services

- **development** – Node.js workspace where the MCP server runs.
- **omada** – Omada controller accessible on https://localhost:8043 and http://localhost:8088.

## Getting started

1. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).
2. Open the repository in VS Code and run **Dev Containers: Reopen in Container**.
3. Once the container is running, the Omada controller becomes available on the forwarded ports and npm dependencies are installed automatically.

> **Tip**
> The development service automatically sets `OMADA_BASE_URL=https://omada:8043`, enabling local integration with the controller sidecar.

Use `npm run dev` inside the container to launch the MCP server in watch mode.
