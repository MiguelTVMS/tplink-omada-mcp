import { Server } from '@modelcontextprotocol/sdk/server.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/transport/node/stdio.js';
import { z } from 'zod';

import { OmadaClient } from './omadaClient.js';

const siteInputSchema = z.object({
  siteId: z.string().min(1).optional()
});

const clientIdSchema = siteInputSchema.extend({
  clientId: z.string().min(1)
});

const deviceIdSchema = siteInputSchema.extend({
  deviceId: z.string().min(1)
});

const customRequestSchema = z.object({
  method: z.string().default('GET'),
  url: z.string().min(1, 'A controller API path is required'),
  params: z.record(z.unknown()).optional(),
  data: z.unknown().optional(),
  siteId: z.string().min(1).optional()
});

function toJsonContent(value: unknown) {
  return [{ type: 'json' as const, json: value }];
}

export async function startServer(client: OmadaClient): Promise<void> {
  const server = new Server({
    name: 'tplink-omada-mcp',
    version: '0.1.0'
  });

  server.registerTool({
    name: 'omada.listSites',
    description: 'List all sites configured on the Omada controller.',
    inputSchema: z.object({}),
    handler: async () => ({
      content: toJsonContent(await client.listSites())
    })
  });

  server.registerTool({
    name: 'omada.listDevices',
    description: 'List provisioned network devices for a specific site.',
    inputSchema: siteInputSchema,
    handler: async (input) => ({
      content: toJsonContent(await client.listDevices(input.siteId))
    })
  });

  server.registerTool({
    name: 'omada.listClients',
    description: 'List network clients connected to a site.',
    inputSchema: siteInputSchema,
    handler: async (input) => ({
      content: toJsonContent(await client.listClients(input.siteId))
    })
  });

  server.registerTool({
    name: 'omada.getDevice',
    description: 'Fetch detailed information for a specific Omada device.',
    inputSchema: deviceIdSchema,
    handler: async (input) => ({
      content: toJsonContent(await client.getDevice(input.deviceId, input.siteId))
    })
  });

  server.registerTool({
    name: 'omada.getClient',
    description: 'Fetch details for a specific Omada client.',
    inputSchema: clientIdSchema,
    handler: async (input) => ({
      content: toJsonContent(await client.getClient(input.clientId, input.siteId))
    })
  });

  server.registerTool({
    name: 'omada.callApi',
    description:
      'Call an arbitrary API path on the Omada controller. The provided URL should be a path, for example /api/v2/sites',
    inputSchema: customRequestSchema,
    handler: async (input) => {
      const resolvedUrl = input.siteId
        ? input.url.replace('{siteId}', input.siteId)
        : input.url;

      const payload = await client.callApi({
        method: input.method,
        url: resolvedUrl,
        params: input.params,
        data: input.data
      });

      return { content: toJsonContent(payload) };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
