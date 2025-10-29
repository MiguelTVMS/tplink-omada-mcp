# GitHub Copilot Instructions for tplink-omada-mcp

## Repository Purpose
This project implements a Model Context Protocol (MCP) server that exposes TP-Link Omada controller APIs. The server is written in TypeScript/Node.js and communicates with MCP clients over stdio.

## Tooling and Runtime
- Node.js 22 LTS (devcontainer base image `mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm`).
- TypeScript 5.9 with `module`/`moduleResolution` set to `NodeNext`.
- Zod 3.x for configuration validation (the MCP SDK currently expects Zod 3 APIs).
- ESLint 9 using the flat config (`eslint.config.js`), plus Prettier 3.

## Key Modules
- `src/server.ts` — MCP server entry point built with `@modelcontextprotocol/sdk/server/mcp`.
- `src/omadaClient.ts` — Axios-based client for Omada controller REST APIs.
- `src/config.ts` — Environment variable loading and validation via Zod.
- `docs/openapi/` — Reference OpenAPI specifications for Omada endpoints, split per API tag.

## Environment Variables
Reference `.env.example`. Primary variables:
- `OMADA_BASE_URL` (required)
- `OMADA_USERNAME`, `OMADA_PASSWORD` (required)
- `OMADA_SITE_ID`, `OMADA_STRICT_SSL`, `OMADA_TIMEOUT`, `OMADA_PROXY_URL` (optional)

## Code Structure
- `src/` — Main source code.
- `src/types/` — TypeScript type definitions. Each type has its own file for clarity. Use Zod types where applicable.
- `src/services/` — Service modules encapsulating business logic and API interactions. Each TAG from the Omada API has a corresponding service file.

## Development Workflow
- Install dependencies: `npm install` (runs automatically on container create).
- Development server: `npm run dev` (tsx watcher).
- Build: `npm run build` (emits to `dist/`).
- Lint: `npm run lint` (ESLint flat config).
- Launch configurations are available under `.vscode/launch.json` for debugging.

## Formatting & Linting
- Follow Prettier defaults (`npm run format`).
- ESLint enforces import ordering and TypeScript best practices.

## Devcontainer Notes
- SSH agent socket is forwarded using `${localEnv:SSH_AUTH_SOCK}` mount; container runs as `node` with UID updated to match the host to support 1Password-integrated SSH keys.

## Contribution Guidelines
- Keep environment secrets out of the repo; only commit `.env.example`.
- Ensure `npm run lint` and `npm run build` pass before committing.
- Reference the OpenAPI spec in `docs/` when adding or updating Omada API interactions.

## Aditional Guidelines
- When adding new features or fixing bugs, create a new branch from `develop` and submit a pull request for review.
- Write unit tests for new functionality and ensure existing tests pass.
- Keep the reference `.env.example` and this documentation up to date with any new environment variables added to the project.
- **DON'T** change the JSON files under `docs/openapi/`; they should only be used as reference for the API endpoints.
- **ONLY** implement using client credentials mode Access processs as described in the Omada API documentation. The client credentials should be provided via environment variables.
- We will implement one API operation at a time. Use the OpenAPI operationId as a guide for naming functions and methods.
- After a operation is implemented, update the README.md file with a table of supported operations in the topic Supported Omada API Operations. This table should include the operationId, a brief description, and any relevant notes about the implementation. Keep it short and concise.