import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const setSwitchPortStatusSchema = z.object({
    siteId: z.string().min(1).optional(),
    switchMac: z.string().min(1, 'switchMac is required'),
    port: z.number().int().min(1, 'port number is required'),
    status: z.number().int().min(0).max(1).describe('0=off, 1=on'),
});

export function registerSetSwitchPortStatusTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'setSwitchPortStatus',
        {
            description: 'Enable or disable a single switch port. 0=off, 1=on.',
            inputSchema: setSwitchPortStatusSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('setSwitchPortStatus', async ({ switchMac, port, status, siteId }) =>
            toToolResult(await client.setSwitchPortStatus(switchMac, port, status, siteId))
        )
    );
}
