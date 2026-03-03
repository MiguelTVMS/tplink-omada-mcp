import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerGetDashboardSwitchSummaryTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getDashboardSwitchSummary',
        {
            description: 'Get switch summary statistics for a site dashboard, including connected switches, PoE usage, and port counts.',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('getDashboardSwitchSummary', async ({ siteId, customHeaders }) =>
            toToolResult(await client.getDashboardSwitchSummary(siteId, customHeaders))
        )
    );
}
