import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerGetSiteInternetLocationIspTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getSiteInternetLocationIsp',
        {
            description: 'Get ISP and location information for the site WAN.',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('getSiteInternetLocationIsp', async ({ siteId, customHeaders }) =>
            toToolResult(await client.getSiteInternetLocationIsp(siteId, customHeaders))
        )
    );
}
