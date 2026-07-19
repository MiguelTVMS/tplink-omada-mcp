import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const blockClientSchema = z.object({
    siteId: z.string().min(1).optional(),
    clientMac: z.string().min(1, 'clientMac is required'),
});

export function registerBlockClientTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'blockClient',
        {
            description: 'Block a client device by its MAC address, preventing it from accessing the network.',
            inputSchema: blockClientSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('blockClient', async ({ clientMac, siteId }) => toToolResult(await client.blockClient(clientMac, siteId)))
    );
}
