import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerGetUrlFilterCategoriesTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getUrlFilterCategories',
        {
            description: 'List available URL filter categories for the site.',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('getUrlFilterCategories', async ({ siteId, customHeaders }) =>
            toToolResult(await client.getUrlFilterCategories(siteId, customHeaders))
        )
    );
}
