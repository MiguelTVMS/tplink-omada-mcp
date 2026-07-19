import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const createFirewallAclSchema = z.object({
    siteId: z.string().min(1).optional(),
    rule: z
        .record(z.unknown())
        .describe('Firewall ACL rule object (fields vary by controller version; use listFirewallAcls to see existing rule shapes)'),
});

export function registerCreateFirewallAclTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'createFirewallAcl',
        {
            description:
                'Create a firewall ACL rule for inter-VLAN isolation or traffic control. ' +
                'Use listFirewallAcls first to see the expected rule shape.',
            inputSchema: createFirewallAclSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('createFirewallAcl', async ({ siteId, rule }) => toToolResult(await client.createFirewallAcl(rule, siteId)))
    );
}
