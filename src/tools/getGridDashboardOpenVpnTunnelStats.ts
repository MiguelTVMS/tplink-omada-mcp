import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema.extend({
    type: z
        .string()
        .min(1)
        .describe('OpenVPN tunnel type filter. Determines which OpenVPN tunnel statistics are returned. Check your controller for supported values.'),
});

export function registerGetGridDashboardOpenVpnTunnelStatsTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getGridDashboardOpenVpnTunnelStats',
        {
            description:
                'Get OpenVPN tunnel statistics by type for the site dashboard. Returns connection counts, traffic volumes, and status for OpenVPN tunnels.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getGridDashboardOpenVpnTunnelStats', async ({ siteId, type, customHeaders }) =>
            toToolResult(await client.getGridDashboardOpenVpnTunnelStats(siteId, type, customHeaders))
        )
    );
}
