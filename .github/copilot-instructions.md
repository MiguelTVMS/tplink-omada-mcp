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
- `docs/omada-openapi.json` — Reference OpenAPI specification for Omada endpoints.

## Environment Variables
Reference `.env.example`. Primary variables:
- `OMADA_BASE_URL` (required)
- `OMADA_USERNAME`, `OMADA_PASSWORD` (required)
- `OMADA_SITE_ID`, `OMADA_STRICT_SSL`, `OMADA_TIMEOUT`, `OMADA_PROXY_URL` (optional)

Keep the reference `.env.example` and this documentation up to date with any new environment variables added to the project.


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
