import { randomUUID } from 'node:crypto';
import http from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import { loadConfigFromEnv } from './config.js';
import { OmadaClient } from './omadaClient.js';
import { createServer as createMcpServer } from './server.js';
import { logger } from './utils/logger.js';

const DEFAULT_PORT = 3000;
const DEFAULT_HOST = '0.0.0.0';
const DEFAULT_PATH = '/mcp';
const HEALTH_PATH = '/healthz';
const TRUE_STRINGS = ['1', 'true', 'yes', 'y', 'on'];
const FALSE_STRINGS = ['0', 'false', 'no', 'n', 'off'];

type ShutdownHandler = () => Promise<void>;

function resolvePort(value: string | undefined, fallback: number): number {
    if (!value) {
        return fallback;
    }

    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65_535) {
        logger.warn('Invalid MCP HTTP port provided', { provided: value, fallback });
        return fallback;
    }

    return parsed;
}

function normalizePath(path: string): string {
    if (!path) {
        return DEFAULT_PATH;
    }

    const startsWithSlash = path.startsWith('/') ? path : `/${path}`;
    if (startsWithSlash.length > 1 && startsWithSlash.endsWith('/')) {
        const trimmed = startsWithSlash.replace(/\/+$/, '');
        return trimmed.length === 0 ? '/' : trimmed;
    }

    return startsWithSlash;
}

function parseList(value: string | undefined): string[] | undefined {
    if (!value) {
        return undefined;
    }

    const items = value
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);

    return items.length > 0 ? items : undefined;
}

function parseBoolean(value: string | undefined): boolean | undefined {
    if (value === undefined) {
        return undefined;
    }

    const normalized = value.trim().toLowerCase();
    if (normalized.length === 0) {
        return undefined;
    }

    if (TRUE_STRINGS.includes(normalized)) {
        return true;
    }

    if (FALSE_STRINGS.includes(normalized)) {
        return false;
    }

    return undefined;
}

function getRequestUrl(req: IncomingMessage, fallbackPort: number): URL | undefined {
    if (!req.url) {
        return undefined;
    }

    const host = req.headers.host ?? `localhost:${fallbackPort}`;
    try {
        return new URL(req.url, `http://${host}`);
    } catch {
        return undefined;
    }
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
    const payload = JSON.stringify(body);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
    });
    res.end(payload);
}

async function createShutdownHandler(
    signal: NodeJS.Signals,
    closeHttp: () => Promise<void>,
    closeServer: () => Promise<void>
): Promise<void> {
    logger.warn('Received shutdown signal', { signal });

    try {
        await closeServer();
    } catch (error) {
        logger.error('Error closing MCP server', { error });
    }

    try {
        await closeHttp();
    } catch (error) {
        logger.error('Error closing HTTP server', { error });
    }
}

async function main(): Promise<void> {
    const config = loadConfigFromEnv();
    const client = new OmadaClient(config);
    const mcpServer = createMcpServer(client);

    const allowedHosts = parseList(process.env.MCP_HTTP_ALLOWED_HOSTS);
    const allowedOrigins = parseList(process.env.MCP_HTTP_ALLOWED_ORIGINS);
    const enableDnsRebindingProtection =
        parseBoolean(process.env.MCP_HTTP_ENABLE_DNS_PROTECTION) ??
        Boolean((allowedHosts?.length ?? 0) > 0 || (allowedOrigins?.length ?? 0) > 0);

    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        allowedHosts,
        allowedOrigins,
        enableDnsRebindingProtection
    });

    transport.onerror = (error) => {
        logger.error('Streamable HTTP transport error', { error });
    };

    await mcpServer.connect(transport);

    const port = resolvePort(process.env.MCP_HTTP_PORT ?? process.env.PORT, DEFAULT_PORT);
    const host = process.env.MCP_HTTP_HOST ?? process.env.HOST ?? DEFAULT_HOST;
    const endpointPath = normalizePath(process.env.MCP_HTTP_PATH ?? DEFAULT_PATH);

    const httpServer = http.createServer(async (req, res) => {
        const url = getRequestUrl(req, port);
        if (!url) {
            logger.warn('HTTP request rejected', { reason: 'invalid-url', method: req.method, url: req.url });
            sendJson(res, 400, { error: 'Invalid request URL.' });
            return;
        }

        logger.info('HTTP request received', {
            method: req.method,
            path: url.pathname,
            query: url.search,
            sessionId: req.headers['mcp-session-id'] ?? undefined
        });

        if (url.pathname === HEALTH_PATH) {
            logger.debug('Health check request served');
            sendJson(res, 200, { status: 'ok' });
            return;
        }

        if (url.pathname !== endpointPath) {
            logger.warn('HTTP request rejected', {
                reason: 'unexpected-path',
                expected: endpointPath,
                received: url.pathname
            });
            sendJson(res, 404, { error: 'Not Found' });
            return;
        }

        try {
            await transport.handleRequest(req, res);
            if (!res.headersSent) {
                logger.debug('Transport completed without sending response headers');
            }
            logger.info('MCP request handled successfully', {
                path: url.pathname,
                method: req.method
            });
        } catch (error) {
            logger.error('Failed to handle MCP HTTP request', { error });
            if (!res.headersSent) {
                sendJson(res, 500, {
                    jsonrpc: '2.0',
                    error: { code: -32000, message: 'Internal server error' },
                    id: null
                });
            } else {
                res.end();
            }
        }
    });

    httpServer.on('clientError', (error, socket) => {
        logger.error('HTTP client error', { error });
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });

    await new Promise<void>((resolve) => {
        httpServer.listen(port, host, () => {
            const displayHost = host === '0.0.0.0' ? 'localhost' : host;
            logger.info('HTTP server listening', {
                endpoint: `http://${displayHost}:${port}${endpointPath}`
            });
            logger.info('HTTP health check available', {
                endpoint: `http://${displayHost}:${port}${HEALTH_PATH}`
            });
            logger.info('HTTP server ready');
            resolve();
        });
    });

    let shuttingDown = false;
    const closeHttp: ShutdownHandler = () =>
        new Promise((resolve) => {
            httpServer.close(() => resolve());
        });
    const closeServer: ShutdownHandler = () => mcpServer.close();

    for (const signal of ['SIGINT', 'SIGTERM'] as const) {
        process.on(signal, () => {
            if (shuttingDown) {
                return;
            }
            shuttingDown = true;
            void createShutdownHandler(signal, closeHttp, closeServer);
        });
    }
}

main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    logger.error('Failed to start MCP HTTP server', { error: message });
    process.exitCode = 1;
});
