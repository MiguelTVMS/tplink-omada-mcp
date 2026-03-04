import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema.extend({
    type: z
        .string()
        .min(1)
        .describe(
            'VPN type filter. Determines which tunnel type statistics are returned (e.g. "ipsec", "openvpn", "wireguard", "l2tp"). Check your controller for supported values.'
        ),
});

export function registerGetGridDashboardTunnelStatsTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getGridDashboardTunnelStats',
        {
            description:
                'Get VPN tunnel statistics by type. Returns connection counts, traffic volumes, and status for VPN tunnels of the specified type (IPsec, OpenVPN, WireGuard, etc.). Use getVpnTunnelStats for a broader summary.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getGridDashboardTunnelStats', async ({ siteId, type, customHeaders }) =>
            toToolResult(await client.getGridDashboardTunnelStats(siteId, type, customHeaders))
        )
    );
}
