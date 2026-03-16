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

export function registerGetGatewayArpTableTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getGatewayArpTable',
        {
            description: 'Get the ARP table for a specific gateway.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getGatewayArpTable', async ({ gatewayMac, siteId, customHeaders }) =>
            toToolResult(await client.getGatewayArpTable(gatewayMac, siteId, customHeaders))
        )
    );
}
