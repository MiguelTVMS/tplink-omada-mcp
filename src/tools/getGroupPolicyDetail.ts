import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerGetGroupPolicyDetailTool(server: McpServer, client: OmadaClient): void {
    const inputSchema = z.object({
        groupType: z.enum(['0', '1', '2']).describe('Group type: "0" = IP Group, "1" = IP Port Group, "2" = Mac Group.'),
        ...siteInputSchema.shape,
    });

    server.registerTool(
        'getGroupPolicyDetail',
        {
            description:
                'Get group policy profiles for a site filtered by group type (IP Group, IP Port Group, or MAC Group). Returns all matching profile entries.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getGroupPolicyDetail', async ({ groupType, siteId, customHeaders }) =>
            toToolResult(await client.getGroupProfilesByType(groupType, siteId, customHeaders))
        )
    );
}
