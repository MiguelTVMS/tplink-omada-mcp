import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema
    .extend({
        gatewayMac: siteInputSchema.shape.siteId.unwrap().describe('MAC address of the gateway'),
    })
    .required({ gatewayMac: true });

export function registerGetGatewayDetailTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getGatewayDetail',
        {
            description: 'Fetch detailed configuration and status information for a specific gateway.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getGatewayDetail', async ({ gatewayMac, siteId, customHeaders }) =>
            toToolResult(await client.getGatewayDetail(gatewayMac, siteId, customHeaders))
        )
    );
}
