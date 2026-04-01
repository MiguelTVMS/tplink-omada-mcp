import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { deviceMacSchema, siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema
    .extend({
        switchMac: deviceMacSchema.describe('MAC address of the switch (e.g. "AA-BB-CC-DD-EE-FF"). Use listDevices to find switch MACs.'),
    })
    .required({ switchMac: true });

export function registerGetSwitchNetworkOverviewTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getSwitchNetworkOverview',
        {
            description: 'Get the network overview for a managed switch. Requires switchMac; siteId is optional and may be defaulted.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getSwitchNetworkOverview', async ({ switchMac, siteId, customHeaders }) =>
            toToolResult(await client.getSwitchNetworkOverview(switchMac, siteId, customHeaders))
        )
    );
}
