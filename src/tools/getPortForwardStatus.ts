import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';
import { createPaginationSchema } from '../utils/pagination-schema.js';

export function registerGetPortForwardStatusTool(server: McpServer, client: OmadaClient): void {
    const inputSchema = z.object({
        type: z
            .string()
            .min(1)
            .describe('Port forwarding type identifier (e.g. "dnat", "upnp"). Determines which forwarding rule category to retrieve status for.'),
        ...createPaginationSchema(),
        ...siteInputSchema.shape,
    });

    server.registerTool(
        'getPortForwardStatus',
        {
            description:
                'Get the active port forwarding status for a specific forwarding type (paginated). Returns currently active port forwarding rules and their connection states.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getPortForwardStatus', async ({ type, page, pageSize, siteId, customHeaders }) =>
            toToolResult(await client.getPortForwardStatus(type, page ?? 1, pageSize ?? 10, siteId, customHeaders))
        )
    );
}
