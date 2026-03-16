import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema
    .extend({
        switchMac: siteInputSchema.shape.siteId
            .unwrap()
            .describe('MAC address of the switch (e.g. "AA-BB-CC-DD-EE-FF"). Use listDevices to find switch MACs.'),
    })
    .required({ switchMac: true });

export function registerGetSwitchArpTableTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getSwitchArpTable',
        {
            description: 'Get the ARP table for a specific switch.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getSwitchArpTable', async ({ switchMac, siteId, customHeaders }) =>
            toToolResult(await client.getSwitchArpTable(switchMac, siteId, customHeaders))
        )
    );
}
