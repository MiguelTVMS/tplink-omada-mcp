import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { EnvironmentConfig } from '../config.js';
import type { OmadaClient } from '../omadaClient/index.js';
import { logger } from '../utils/logger.js';
import { createServer } from './common.js';

interface StreamTransportState {
    transport: StreamableHTTPServerTransport;
    server: ReturnType<typeof createServer>;
}

// Export the type for use in http.ts
export type { StreamTransportState };

/**
 * Creates a Streamable HTTP transport
 * This implements the MCP protocol version 2025-03-26
 */
export function createStreamTransport(client: OmadaClient, config: EnvironmentConfig): StreamTransportState {
    const mcpServer = createServer(client);

    const enableStatefulSessions = config.stateful;
    const sessionIdGenerator = enableStatefulSessions ? () => randomUUID() : undefined;

    if (!enableStatefulSessions) {
        logger.info('Starting Streamable HTTP transport in stateless mode; Mcp-Session-Id headers are optional');
    }

    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator,
        allowedOrigins: config.httpAllowedOrigins,
        enableDnsRebindingProtection: true,
        onsessioninitialized: (sessionId: string) => {
            logger.info('Session initialized', { sessionId });
        },
        onsessionclosed: (sessionId: string) => {
            logger.info('Session closed', { sessionId });
        },
    });

    transport.onerror = (error: Error) => {
        logger.error('Streamable HTTP transport error', { error });
    };

    return { transport, server: mcpServer };
}

/**
 * Handles incoming Streamable HTTP requests (GET, POST, DELETE)
 * For stateful mode, transports should be stored and reused by the caller
 */
export async function handleStreamRequest(
    client: OmadaClient,
    config: EnvironmentConfig,
    req: IncomingMessage,
    res: ServerResponse,
    parsedBody?: unknown,
    existingTransport?: StreamTransportState
): Promise<StreamTransportState | void> {
    logger.info('Streamable HTTP request received', {
        method: req.method,
        url: req.url,
        sessionId: req.headers['mcp-session-id'] ?? undefined,
    });

    // Reuse existing transport if provided, otherwise create new one
    const state = existingTransport ?? createStreamTransport(client, config);

    if (!existingTransport) {
        await state.server.connect(state.transport);
    }

    await state.transport.handleRequest(req, res, parsedBody);

    logger.debug('Streamable HTTP request handled', {
        method: req.method,
        sessionId: req.headers['mcp-session-id'] ?? undefined,
    });

    // Return state for session management if stateful
    if (config.stateful) {
        return state;
    }
}
