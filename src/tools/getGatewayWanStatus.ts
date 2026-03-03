import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema
    .extend({
        gatewayMac: siteInputSchema.shape.siteId.unwrap().describe('MAC address of the gateway'),
    })
    .required({ gatewayMac: true });

export function registerGetGatewayWanStatusTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getGatewayWanStatus',
        {
            description: 'Get the WAN port status and connectivity information for a specific gateway.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getGatewayWanStatus', async ({ gatewayMac, siteId, customHeaders }) =>
            toToolResult(await client.getGatewayWanStatus(gatewayMac, siteId, customHeaders))
        )
    );
}
