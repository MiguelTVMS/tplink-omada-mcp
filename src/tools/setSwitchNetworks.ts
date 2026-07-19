import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const setSwitchNetworksSchema = z.object({
    siteId: z.string().min(1).optional(),
    switchMac: z.string().min(1, 'switchMac is required'),
    data: z.record(z.string(), z.unknown()).describe('Switch network / VLAN trunking configuration payload'),
});

export function registerSetSwitchNetworksTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'setSwitchNetworks',
        {
            description: 'Set switch networks / VLAN trunking configuration for a switch.',
            inputSchema: setSwitchNetworksSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('setSwitchNetworks', async ({ switchMac, data, siteId }) =>
            toToolResult(await client.setSwitchNetworks(switchMac, data, siteId))
        )
    );
}
