import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerListTimeRangeProfilesTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'listTimeRangeProfiles',
        {
            description: 'List time range profiles used for scheduling in a site (e.g., for ACLs, port schedules).',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('listTimeRangeProfiles', async ({ siteId, customHeaders }) =>
            toToolResult(await client.listTimeRangeProfiles(siteId, customHeaders))
        )
    );
}
