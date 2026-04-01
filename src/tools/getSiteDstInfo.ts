import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerGetSiteDstInfoTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getSiteDstInfo',
        {
            description: 'Get DST and timezone information for a specific site.',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('getSiteDstInfo', async ({ siteId, customHeaders }) => toToolResult(await client.getSiteDstInfo(siteId, customHeaders)))
    );
}
