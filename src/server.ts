import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import type {
  CallToolResult,
  ServerNotification,
  ServerRequest
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import type { OmadaClient } from './omadaClient.js';
import { logger } from './utils/logger.js';

const siteInputSchema = z.object({
  siteId: z.string().min(1).optional()
});

const clientIdSchema = siteInputSchema.extend({
  clientId: z.string().min(1, 'clientId (MAC or client identifier) is required')
});

const deviceIdSchema = siteInputSchema.extend({
  deviceId: z.string().min(1, 'deviceId (MAC or device identifier) is required')
});

const customRequestSchema = z.object({
  method: z.string().default('GET'),
  url: z.string().min(1, 'A controller API path is required'),
  params: z.record(z.string(), z.unknown()).optional(),
  data: z.unknown().optional(),
  siteId: z.string().min(1).optional()
});

const stackIdSchema = siteInputSchema.extend({
  stackId: z.string().min(1, 'stackId is required')
});

function toToolResult(value: unknown) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2) ?? '';

  return {
    content: text ? [{ type: 'text' as const, text }] : []
  };
}

function safeSerialize(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return '[unserializable]';
  }
}

function summarizeSuccess(method: string, result: unknown): Record<string, unknown> | undefined {
  if (!result || typeof result !== 'object') {
    return undefined;
  }

  const payload = result as Record<string, unknown>;

  switch (method) {
    case 'initialize': {
      const protocolVersion = payload['protocolVersion'];
      return typeof protocolVersion === 'string' ? { protocolVersion } : undefined;
    }
    case 'tools/list': {
      const tools = Array.isArray(payload['tools']) ? payload['tools'] : undefined;
      return tools ? { toolCount: tools.length } : undefined;
    }
    case 'tools/call': {
      const name = payload['name'];
      if (typeof name === 'string') {
        return { tool: name };
      }
      break;
    }
    default:
      break;
  }

  return undefined;
}

type ToolExtra = RequestHandlerExtra<ServerRequest, ServerNotification>;

function wrapToolHandler<Args extends z.ZodRawShape>(
  name: string,
  handler: (
    args: z.objectOutputType<Args, z.ZodTypeAny>,
    extra: ToolExtra
  ) => Promise<CallToolResult>
): (
  args: z.objectOutputType<Args, z.ZodTypeAny>,
  extra: ToolExtra
) => Promise<CallToolResult> {
  return async (
    args: z.objectOutputType<Args, z.ZodTypeAny>,
    extra: ToolExtra
  ): Promise<CallToolResult> => {
    const sessionId = extra.sessionId ?? 'unknown-session';
    logger.info('Tool invoked', { tool: name, sessionId, args: safeSerialize(args) });

    try {
      const result = await handler(args, extra);
      logger.info('Tool completed', { tool: name, sessionId });
      return result;
    } catch (error) {
      logger.error('Tool failed', {
        tool: name,
        sessionId,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  };
}

export function createServer(client: OmadaClient): McpServer {
  const server = new McpServer({
    name: 'tplink-omada-mcp',
    version: '0.1.0'
  });

  const protocol = server.server;
  type RequestSchema = Parameters<typeof protocol.setRequestHandler>[0];
  type RequestCallback = Parameters<typeof protocol.setRequestHandler>[1];

  const originalSetRequestHandler = protocol.setRequestHandler.bind(protocol);
  protocol.setRequestHandler = function patchedSetRequestHandler(
    schema: RequestSchema,
    handler: RequestCallback
  ) {
    const method = (schema as { shape: { method: { value: string } } }).shape.method.value;
    const wrapped: RequestCallback = async (request, extra) => {
      const sessionId = extra.sessionId ?? 'unknown-session';
      const logFields: Record<string, unknown> = { method, sessionId };
      if ('params' in request) {
        logFields.params = safeSerialize((request as { params: unknown }).params);
      }
      logger.info('MCP request received', logFields);

      try {
        const result = await handler(request, extra);
        const summary = summarizeSuccess(method, result);
        logger.info('MCP request handled', summary ? { method, sessionId, ...summary } : { method, sessionId });
        return result;
      } catch (error) {
        logger.error('MCP request failed', {
          method,
          sessionId,
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    };

    return originalSetRequestHandler(schema, wrapped);
  };

  server.server.oninitialized = () => {
    // getCapabilities is private; probe cautiously via narrowed cast without using `any`.
    interface ServerWithCapabilities {
      getCapabilities?: () => unknown;
    }
    const capabilities = (server.server as unknown as ServerWithCapabilities).getCapabilities?.();
    if (capabilities) {
      logger.info('Server initialization completed', { capabilities });
    } else {
      logger.info('Server initialization completed');
    }
  };

  server.server.onclose = () => {
    logger.warn('Server connection closed');
  };

  server.server.onerror = (error) => {
    logger.error('Server error', { error });
  };

  server.server.fallbackRequestHandler = async (request, extra) => {
    const sessionId = extra.sessionId ?? 'unknown-session';
    logger.warn('Unhandled request received', {
      method: request.method,
      sessionId,
      params: safeSerialize(request.params)
    });
    throw new Error(`Unhandled request: ${request.method}`);
  };

  server.server.fallbackNotificationHandler = async (notification) => {
    logger.warn('Unhandled notification received', {
      method: notification.method,
      params: safeSerialize(notification.params)
    });
  };

  server.registerTool(
    'omada.listSites',
    {
      description: 'List all sites configured on the Omada controller.'
    },
    async (extra) => {
      const sessionId = extra.sessionId ?? 'unknown-session';
      logger.info('Tool invoked', { tool: 'omada.listSites', sessionId });

      try {
        const result = toToolResult(await client.listSites());
        logger.info('Tool completed', { tool: 'omada.listSites', sessionId });
        return result;
      } catch (error) {
        logger.error('Tool failed', {
          tool: 'omada.listSites',
          sessionId,
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    }
  );

  server.registerTool(
    'omada.listDevices',
    {
      description: 'List provisioned network devices for a specific site.',
      inputSchema: siteInputSchema.shape
    },
    wrapToolHandler('omada.listDevices', async ({ siteId }) =>
      toToolResult(await client.listDevices(siteId))
    )
  );

  server.registerTool(
    'omada.listClients',
    {
      description: 'List network clients connected to a site.',
      inputSchema: siteInputSchema.shape
    },
    wrapToolHandler('omada.listClients', async ({ siteId }) =>
      toToolResult(await client.listClients(siteId))
    )
  );

  server.registerTool(
    'omada.getDevice',
    {
      description: 'Fetch detailed information for a specific Omada device.',
      inputSchema: deviceIdSchema.shape
    },
    wrapToolHandler('omada.getDevice', async ({ deviceId, siteId }) =>
      toToolResult(await client.getDevice(deviceId, siteId))
    )
  );

  server.registerTool(
    'omada.getSwitchStackDetail',
    {
      description: 'Fetch detailed information for a specific switch stack.',
      inputSchema: stackIdSchema.shape
    },
    wrapToolHandler('omada.getSwitchStackDetail', async ({ stackId, siteId }) =>
      toToolResult(await client.getSwitchStackDetail(stackId, siteId))
    )
  );

  server.registerTool(
    'omada.getClient',
    {
      description: 'Fetch details for a specific Omada client.',
      inputSchema: clientIdSchema.shape
    },
    wrapToolHandler('omada.getClient', async ({ clientId, siteId }) =>
      toToolResult(await client.getClient(clientId, siteId))
    )
  );

  server.registerTool(
    'omada.callApi',
    {
      description:
        'Call an arbitrary API path on the Omada controller. The provided URL should be a path, for example /openapi/v1/{omadacId}/sites',
      inputSchema: customRequestSchema.shape
    },
    wrapToolHandler('omada.callApi', async ({ method, url, params, data, siteId }) => {
      const resolvedUrl = siteId ? url.replace('{siteId}', siteId) : url;

      const payload = await client.callApi({
        method,
        url: resolvedUrl,
        params,
        data
      });

      return toToolResult(payload);
    })
  );

  return server;
}

export async function startServer(client: OmadaClient, transport?: Transport): Promise<void> {
  const server = createServer(client);
  const activeTransport = transport ?? new StdioServerTransport();
  logger.info('Connecting server', { transport: activeTransport.constructor.name });
  await server.connect(activeTransport);
  logger.info('Server connected');
}
