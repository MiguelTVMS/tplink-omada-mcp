import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const getSwitchPortsSchema = z.object({
    siteId: z.string().min(1).optional(),
    switchMac: z.string().min(1, 'switchMac is required'),
});

export function registerGetSwitchPortsTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getSwitchPorts',
        {
            description: 'Get all ports for a switch by its MAC address, including status, profile, PoE, link speed, and STP state.',
            inputSchema: getSwitchPortsSchema.shape,
        },
        wrapToolHandler('getSwitchPorts', async ({ switchMac, siteId }) => toToolResult(await client.getSwitchPorts(switchMac, siteId)))
    );
}
