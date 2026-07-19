import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerListRoutesTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'listRoutes',
        {
            description: 'List static routes configured for a site.',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('listRoutes', async ({ siteId }) => toToolResult(await client.listRoutes(siteId)))
    );
}
