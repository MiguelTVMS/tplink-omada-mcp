import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema
    .extend({
        gatewayMac: siteInputSchema.shape.siteId
            .unwrap()
            .describe('MAC address of the gateway (e.g. "AA-BB-CC-DD-EE-FF"). Use listDevices to find the gateway MAC.'),
    })
    .required({ gatewayMac: true });

export function registerGetGatewayHaStatusTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getGatewayHaStatus',
        {
            description: 'Get High Availability (HA) status for a specific gateway.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getGatewayHaStatus', async ({ gatewayMac, siteId, customHeaders }) =>
            toToolResult(await client.getGatewayHaStatus(gatewayMac, siteId, customHeaders))
        )
    );
}
