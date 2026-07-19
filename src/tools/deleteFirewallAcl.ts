import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const deleteFirewallAclSchema = z.object({
    siteId: z.string().min(1).optional(),
    aclId: z.string().min(1, 'aclId is required'),
});

export function registerDeleteFirewallAclTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'deleteFirewallAcl',
        {
            description: 'Delete a firewall ACL rule by its ID.',
            inputSchema: deleteFirewallAclSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('deleteFirewallAcl', async ({ aclId, siteId }) => toToolResult(await client.deleteFirewallAcl(aclId, siteId)))
    );
}
