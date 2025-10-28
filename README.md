# TP-Link Omada MCP server

A Model Context Protocol (MCP) server implemented in TypeScript that exposes the TP-Link Omada controller APIs to AI copilots and automation workflows. The server authenticates against a controller, lists sites, devices, and connected clients, and offers a generic tool to invoke arbitrary Omada API endpoints.

## Features

- Secure login to Omada controllers with automatic token refresh
- Tools for retrieving sites, network devices, and connected clients
- Generic Omada API invoker for advanced automation scenarios
- Environment-driven configuration
- Ready-to-use devcontainer with a companion Omada controller service

## Getting started

### Prerequisites

- Node.js 20 or later
- npm 9 or later
- Access to a TP-Link Omada controller (for example using the `mbentley/omada-controller` Docker image)

### Installation

```bash
npm install
```

### Configuration

The MCP server reads its configuration from environment variables:

| Variable | Description |
| --- | --- |
| `OMADA_BASE_URL` | Base URL of the Omada controller, e.g. `https://localhost:8043` |
| `OMADA_USERNAME` | Controller username |
| `OMADA_PASSWORD` | Controller password |
| `OMADA_SITE_ID` | Optional default site identifier used when a tool call does not specify one |
| `OMADA_STRICT_SSL` | Set to `false` to allow self-signed TLS certificates |
| `OMADA_TIMEOUT` | Optional request timeout in milliseconds |
| `OMADA_PROXY_URL` | Optional HTTPS proxy URL for outbound requests |

Create a `.env` file (ignored by git) or export the variables before launching the server.

### Development

```bash
npm run dev
```

The dev mode keeps the TypeScript server running with live reload support via `tsx`.

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### Running the MCP server

```bash
npm start
```

The MCP server communicates over standard input and output. Integrate it with MCP-compatible clients by referencing the `npm start` command and providing the required environment variables.

## Tools

| Tool | Description |
| --- | --- |
| `omada.listSites` | Lists all sites configured on the controller. |
| `omada.listDevices` | Lists provisioned devices for a given site. |
| `omada.listClients` | Lists active client devices for a site. |
| `omada.getDevice` | Fetches details for a specific Omada device. |
| `omada.getClient` | Fetches details for a specific client device. |
| `omada.callApi` | Executes a raw API request using the established Omada session. |

## Devcontainer support

The repository includes a ready-to-use [devcontainer](https://containers.dev/) configuration with a dedicated Omada controller sidecar for local development and testing. See [`.devcontainer/README.md`](.devcontainer/README.md) for details.

## License

This project is licensed under the [MIT License](LICENSE).
