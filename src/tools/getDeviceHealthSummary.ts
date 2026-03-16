import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerGetDeviceHealthSummaryTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getDeviceHealthSummary',
        {
            description: 'Get a health summary of all devices in a site including online/offline counts.',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('getDeviceHealthSummary', async ({ siteId, customHeaders }) =>
            toToolResult(await client.getDeviceHealthSummary(siteId, customHeaders))
        )
    );
}
