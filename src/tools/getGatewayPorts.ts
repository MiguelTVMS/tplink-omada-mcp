import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema
    .extend({
        gatewayMac: siteInputSchema.shape.siteId.unwrap().describe('MAC address of the gateway'),
    })
    .required({ gatewayMac: true });

export function registerGetGatewayPortsTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getGatewayPorts',
        {
            description: 'Get all port information for a specific gateway.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getGatewayPorts', async ({ gatewayMac, siteId, customHeaders }) =>
            toToolResult(await client.getGatewayPorts(gatewayMac, siteId, customHeaders))
        )
    );
}
