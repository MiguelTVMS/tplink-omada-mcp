import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const reconnectClientSchema = z.object({
    siteId: z.string().min(1).optional(),
    clientMac: z.string().min(1, 'clientMac is required'),
});

export function registerReconnectClientTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'reconnectClient',
        {
            description: 'Force a client to reconnect to the network by its MAC address.',
            inputSchema: reconnectClientSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('reconnectClient', async ({ clientMac, siteId }) => toToolResult(await client.reconnectClient(clientMac, siteId)))
    );
}
