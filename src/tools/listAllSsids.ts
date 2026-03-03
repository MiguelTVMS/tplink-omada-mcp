import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerListAllSsidsTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'listAllSsids',
        {
            description: 'List all wireless SSIDs across all WLAN groups in a site.',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('listAllSsids', async ({ siteId, customHeaders }) => toToolResult(await client.listAllSsids(siteId, customHeaders)))
    );
}
