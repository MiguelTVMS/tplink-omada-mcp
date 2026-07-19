import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const batchSetSwitchPortPoeSchema = z.object({
    siteId: z.string().min(1).optional(),
    switchMac: z.string().min(1, 'switchMac is required'),
    portList: z.array(z.number().int().min(1)).min(1, 'portList must contain at least one port'),
    poeMode: z.number().int().min(0).max(1).describe('1=on (802.3at/af), 0=off'),
});

export function registerBatchSetSwitchPortPoeTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'batchSetSwitchPortPoe',
        {
            description: 'Batch enable or disable PoE on multiple switch ports. 1=on (802.3at/af), 0=off.',
            inputSchema: batchSetSwitchPortPoeSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('batchSetSwitchPortPoe', async ({ switchMac, portList, poeMode, siteId }) =>
            toToolResult(await client.batchSetSwitchPortPoe(switchMac, portList, poeMode, siteId))
        )
    );
}
