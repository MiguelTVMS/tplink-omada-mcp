import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerListEapAclsTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'listEapAcls',
        {
            description: 'List EAP (access point) ACL rules configured for a site.',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('listEapAcls', async ({ siteId, customHeaders }) => toToolResult(await client.listEapAcls(siteId, customHeaders)))
    );
}
