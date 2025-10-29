# TP-Link Omada MCP server

A Model Context Protocol (MCP) server implemented in TypeScript that exposes the TP-Link Omada controller APIs to AI copilots and automation workflows. The server authenticates against a controller, lists sites, devices, and connected clients, and offers a generic tool to invoke arbitrary Omada API endpoints.

## Features

- OAuth client-credentials authentication with automatic token refresh
- Tools for retrieving sites, network devices, and connected clients
- Generic Omada API invoker for advanced automation scenarios
- Environment-driven configuration
- Per-tag Omada OpenAPI references stored under `docs/openapi`
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
| `OMADA_CLIENT_ID` | OAuth client identifier generated in Omada Platform Integration |
| `OMADA_CLIENT_SECRET` | OAuth client secret associated with the client ID |
| `OMADA_OMADAC_ID` | Omada controller (omadacId) to target. `OMADA_CONTROLLER_ID` is supported as an alias |
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

### Docker images

Two container images are provided:

```bash
npm run docker:build       # Build the CLI/stdio image (tag: ghcr.io/migueltvms/tplink-omada-mcp-cli:latest)
npm run docker:run         # Launch the CLI/stdio image with your .env file
npm run docker:build:http  # Build the HTTP/SSE image (tag: ghcr.io/migueltvms/tplink-omada-mcp-http:latest)
npm run docker:run:http    # Launch the HTTP/SSE image and publish port 3000
```

Use `npm run docker:push` and `npm run docker:push:http` to publish the images after authenticating with GitHub Container Registry.

### HTTP/SSE transport

Some clients, such as the OpenAI MCP connector, require an HTTP endpoint with Server-Sent Events. Start the streamable HTTP transport with:

```bash
npm run dev:http   # live reload during development
npm run start:http # run the compiled output
npm run ngrok:http  # expose the HTTP/SSE server via ngrok
```

By default, the server listens on `0.0.0.0:3000` and exposes the MCP endpoint at `/mcp` with a health check on `/healthz`. Configure the host, port, and path using the optional `MCP_HTTP_*` environment variables documented in `.env.example`. The `npm run docker:run:http` helper wraps the HTTP/SSE image and publishes the port automatically.

To share the local server with remote tooling, run `npm run ngrok:http` in a separate terminal after signing in with `ngrok config add-authtoken <token>`. The command forwards a public HTTPS URL to `http://localhost:3000` and prints the tunnel address in the console.

If an intermediary strips the `Mcp-Session-Id` header, set `MCP_HTTP_STATEFUL=false` to disable server-managed sessions and allow stateless requests.

## Tools

| Tool | Description |
| --- | --- |
| `omada.listSites` | Lists all sites configured on the controller. |
| `omada.listDevices` | Lists provisioned devices for a given site. |
| `omada.listClients` | Lists active client devices for a site. |
| `omada.getDevice` | Fetches details for a specific Omada device. |
| `omada.getSwitchStackDetail` | Retrieves detailed configuration and status for a switch stack. |
| `omada.getClient` | Fetches details for a specific client device. |
| `omada.callApi` | Executes a raw API request using the established Omada session token. |

## Supported Omada API Operations

| Operation ID | Description | Notes |
| --- | --- | --- |
| `getSiteList` | List controller sites. | Backed by `omada.listSites`; automatic pagination is handled client-side. |
| `getDeviceList` | List devices assigned to a site. | Used by `omada.listDevices` and `omada.getDevice` (single device lookup is resolved from this list). |
| `getGridActiveClients` | List active clients connected to a site. | Used by `omada.listClients` and `omada.getClient` (single client lookup is resolved from this list). |
| `getOswStackDetail` | Retrieve details for a switch stack. | Used by `omada.getSwitchStackDetail`. |

## Devcontainer support

The repository includes a ready-to-use [devcontainer](https://containers.dev/) configuration with a dedicated Omada controller sidecar for local development and testing. See [`.devcontainer/README.md`](.devcontainer/README.md) for details.

## License

This project is licensed under the [MIT License](LICENSE).
