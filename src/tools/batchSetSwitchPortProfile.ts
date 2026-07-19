import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const batchSetSwitchPortProfileSchema = z.object({
    siteId: z.string().min(1).optional(),
    switchMac: z.string().min(1, 'switchMac is required'),
    portList: z.array(z.number().int().min(1)).min(1, 'portList must contain at least one port'),
    profileOverrideEnable: z.boolean().describe('Enable or disable profile override on all specified ports'),
});

export function registerBatchSetSwitchPortProfileTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'batchSetSwitchPortProfile',
        {
            description: 'Batch enable or disable profile override on multiple switch ports.',
            inputSchema: batchSetSwitchPortProfileSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('batchSetSwitchPortProfile', async ({ switchMac, portList, profileOverrideEnable, siteId }) =>
            toToolResult(await client.batchSetSwitchPortProfile(switchMac, portList, profileOverrideEnable, siteId))
        )
    );
}
