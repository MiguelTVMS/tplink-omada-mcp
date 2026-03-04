import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerGetIpsecVpnStatsTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getIpsecVpnStats',
        {
            description: 'Get IPsec VPN tunnel statistics for a site, including active IPsec tunnels, traffic metrics, and connection status.',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('getIpsecVpnStats', async ({ siteId, customHeaders }) => toToolResult(await client.getIpsecVpnStats(siteId, customHeaders)))
    );
}
