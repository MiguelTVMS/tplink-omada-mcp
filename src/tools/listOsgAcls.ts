import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerListOsgAclsTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'listOsgAcls',
        {
            description: 'List OSG (gateway) ACL rules configured for a site.',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('listOsgAcls', async ({ siteId, customHeaders }) => toToolResult(await client.listOsgAcls(siteId, customHeaders)))
    );
}
