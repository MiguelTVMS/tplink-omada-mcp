import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const getSwitchSchema = z.object({
    siteId: z.string().min(1).optional(),
    switchMac: z.string().min(1, 'switchMac is required'),
});

export function registerGetSwitchTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getSwitch',
        {
            description: 'Get full switch info including portList array by MAC address.',
            inputSchema: getSwitchSchema.shape,
        },
        wrapToolHandler('getSwitch', async ({ switchMac, siteId }) => toToolResult(await client.getSwitch(switchMac, siteId)))
    );
}
