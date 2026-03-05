import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerGetWireguardSummaryTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getWireguardSummary',
        {
            description: 'Get the WireGuard VPN summary for the site, including overall tunnel count and connection status.',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('getWireguardSummary', async ({ siteId, customHeaders }) =>
            toToolResult(await client.getWireguardSummary(siteId, customHeaders))
        )
    );
}
