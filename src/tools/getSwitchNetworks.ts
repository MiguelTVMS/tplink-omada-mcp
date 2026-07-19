import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const getSwitchNetworksSchema = z.object({
    siteId: z.string().min(1).optional(),
    switchMac: z.string().min(1, 'switchMac is required'),
});

export function registerGetSwitchNetworksTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getSwitchNetworks',
        {
            description: 'Get switch networks / VLAN trunking configuration for a switch.',
            inputSchema: getSwitchNetworksSchema.shape,
        },
        wrapToolHandler('getSwitchNetworks', async ({ switchMac, siteId }) => toToolResult(await client.getSwitchNetworks(switchMac, siteId)))
    );
}
