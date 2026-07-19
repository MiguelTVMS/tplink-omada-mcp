import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const setSwitchPortPoeSchema = z.object({
    siteId: z.string().min(1).optional(),
    switchMac: z.string().min(1, 'switchMac is required'),
    port: z.number().int().min(1, 'port number is required'),
    poeMode: z.number().int().min(0).max(1).describe('1=on (802.3at/af), 0=off'),
});

export function registerSetSwitchPortPoeTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'setSwitchPortPoe',
        {
            description: 'Enable or disable PoE on a single switch port. 1=on (802.3at/af), 0=off.',
            inputSchema: setSwitchPortPoeSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('setSwitchPortPoe', async ({ switchMac, port, poeMode, siteId }) =>
            toToolResult(await client.setSwitchPortPoe(switchMac, port, poeMode, siteId))
        )
    );
}
