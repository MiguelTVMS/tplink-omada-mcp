import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { z } from 'zod';

import type { OmadaClient } from './omadaClient.js';

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

function toToolResult(value: unknown) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2) ?? '';

  return {
    content: text ? [{ type: 'text' as const, text }] : []
  };
}

export function createServer(client: OmadaClient): McpServer {
  const server = new McpServer({
    name: 'tplink-omada-mcp',
    version: '0.1.0'
  });

  server.registerTool(
    'omada.listSites',
    {
      description: 'List all sites configured on the Omada controller.'
    },
    async () => toToolResult(await client.listSites())
  );

  server.registerTool(
    'omada.listDevices',
    {
      description: 'List provisioned network devices for a specific site.',
      inputSchema: siteInputSchema.shape
    },
    async ({ siteId }) => toToolResult(await client.listDevices(siteId))
  );

  server.registerTool(
    'omada.listClients',
    {
      description: 'List network clients connected to a site.',
      inputSchema: siteInputSchema.shape
    },
    async ({ siteId }) => toToolResult(await client.listClients(siteId))
  );

  server.registerTool(
    'omada.getDevice',
    {
      description: 'Fetch detailed information for a specific Omada device.',
      inputSchema: deviceIdSchema.shape
    },
    async ({ deviceId, siteId }) => toToolResult(await client.getDevice(deviceId, siteId))
  );

  server.registerTool(
    'omada.getClient',
    {
      description: 'Fetch details for a specific Omada client.',
      inputSchema: clientIdSchema.shape
    },
    async ({ clientId, siteId }) => toToolResult(await client.getClient(clientId, siteId))
  );

  server.registerTool(
    'omada.callApi',
    {
      description:
        'Call an arbitrary API path on the Omada controller. The provided URL should be a path, for example /openapi/v1/{omadacId}/sites',
      inputSchema: customRequestSchema.shape
    },
    async ({ method, url, params, data, siteId }) => {
      const resolvedUrl = siteId ? url.replace('{siteId}', siteId) : url;

      const payload = await client.callApi({
        method,
        url: resolvedUrl,
        params,
        data
      });

      return toToolResult(payload);
    }
  );

  return server;
}

export async function startServer(client: OmadaClient, transport?: Transport): Promise<void> {
  const server = createServer(client);
  const activeTransport = transport ?? new StdioServerTransport();
  await server.connect(activeTransport);
}
