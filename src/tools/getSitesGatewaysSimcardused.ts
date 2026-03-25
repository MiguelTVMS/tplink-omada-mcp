import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema
    .extend({
        gatewayMac: siteInputSchema.shape.siteId
            .unwrap()
            .describe('MAC address of the gateway (e.g. "AA-BB-CC-DD-EE-FF"). Use listDevices to find gateway MACs.'),
    })
    .required({ gatewayMac: true });

export function registerGetSitesGatewaysSimcardusedTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getSitesGatewaysSimcardused',
        {
            description: 'Get SIM card used by a gateway.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getSitesGatewaysSimcardused', async ({ gatewayMac, siteId, customHeaders }) =>
            toToolResult(await client.getSitesGatewaysSimcardused(gatewayMac, siteId, customHeaders))
        )
    );
}
