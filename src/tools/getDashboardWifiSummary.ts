import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerGetDashboardWifiSummaryTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getDashboardWifiSummary',
        {
            description: 'Get WiFi summary statistics for a site dashboard, including connected APs, clients, and channel utilization.',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('getDashboardWifiSummary', async ({ siteId, customHeaders }) =>
            toToolResult(await client.getDashboardWifiSummary(siteId, customHeaders))
        )
    );
}
