import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerListPortForwardingRulesTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'listPortForwardingRules',
        {
            description: 'List NAT port forwarding rules configured for a site.',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('listPortForwardingRules', async ({ siteId, customHeaders }) =>
            toToolResult(await client.listPortForwardingRules(siteId, customHeaders))
        )
    );
}
