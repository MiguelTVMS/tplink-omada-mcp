import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const deleteLanNetworkSchema = z.object({
    siteId: z.string().min(1).optional(),
    networkId: z.string().min(1, 'networkId is required'),
});

export function registerDeleteLanNetworkTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'deleteLanNetwork',
        {
            description: 'Delete a LAN network by its network ID.',
            inputSchema: deleteLanNetworkSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('deleteLanNetwork', async ({ siteId, networkId }) => toToolResult(await client.deleteLanNetwork(networkId, siteId)))
    );
}
