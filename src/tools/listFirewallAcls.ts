import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerListFirewallAclsTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'listFirewallAcls',
        {
            description: 'List firewall ACL rules for a site (access control lists for inter-VLAN traffic, etc.).',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('listFirewallAcls', async ({ siteId }) => toToolResult(await client.listFirewallAcls(siteId)))
    );
}
