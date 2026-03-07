import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema.extend({
    customHeaders: customHeadersSchema,
});

export function registerGetPortForwardingListTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getPortForwardingList',
        {
            description:
                'Get all port forwarding rules for the site gateway. Returns the complete list of NAT port forwarding entries that map external ports to internal hosts.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getPortForwardingList', async ({ siteId, customHeaders }) =>
            toToolResult(await client.listPortForwardingRules(siteId, customHeaders))
        )
    );
}
