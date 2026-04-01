import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerGetFirewallTimeoutDefaultsTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getFirewallTimeoutDefaults',
        {
            description: 'Get default firewall session timeout values for the site.',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('getFirewallTimeoutDefaults', async ({ siteId, customHeaders }) =>
            toToolResult(await client.getFirewallTimeoutDefaults(siteId, customHeaders))
        )
    );
}
