import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const batchSetSwitchPortStatusSchema = z.object({
    siteId: z.string().min(1).optional(),
    switchMac: z.string().min(1, 'switchMac is required'),
    portList: z.array(z.number().int().min(1)).min(1, 'portList must contain at least one port'),
    status: z.number().int().min(0).max(1).describe('0=off, 1=on'),
});

export function registerBatchSetSwitchPortStatusTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'batchSetSwitchPortStatus',
        {
            description: 'Batch enable or disable multiple switch ports. 0=off, 1=on.',
            inputSchema: batchSetSwitchPortStatusSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('batchSetSwitchPortStatus', async ({ switchMac, portList, status, siteId }) =>
            toToolResult(await client.batchSetSwitchPortStatus(switchMac, portList, status, siteId))
        )
    );
}
