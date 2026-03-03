import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerGetDashboardOverviewTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getDashboardOverview',
        {
            description: 'Get the site overview diagram data, including device counts and connectivity topology.',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('getDashboardOverview', async ({ siteId, customHeaders }) =>
            toToolResult(await client.getDashboardOverview(siteId, customHeaders))
        )
    );
}
