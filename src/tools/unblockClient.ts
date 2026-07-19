import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const unblockClientSchema = z.object({
    siteId: z.string().min(1).optional(),
    clientMac: z.string().min(1, 'clientMac is required'),
});

export function registerUnblockClientTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'unblockClient',
        {
            description: 'Unblock a previously blocked client device by its MAC address, restoring network access.',
            inputSchema: unblockClientSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('unblockClient', async ({ clientMac, siteId }) => toToolResult(await client.unblockClient(clientMac, siteId)))
    );
}
