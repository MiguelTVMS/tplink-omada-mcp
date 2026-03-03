import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema
    .extend({
        apMac: siteInputSchema.shape.siteId.unwrap().describe('MAC address of the access point'),
    })
    .required({ apMac: true });

export function registerGetApDetailTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getApDetail',
        {
            description: 'Fetch detailed configuration and status information for a specific access point (AP).',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getApDetail', async ({ apMac, siteId, customHeaders }) =>
            toToolResult(await client.getApDetail(apMac, siteId, customHeaders))
        )
    );
}
