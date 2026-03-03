import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema
    .extend({
        switchMac: siteInputSchema.shape.siteId.unwrap().describe('MAC address of the switch'),
    })
    .required({ switchMac: true });

export function registerGetSwitchDetailTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getSwitchDetail',
        {
            description: 'Fetch detailed configuration and status information for a specific switch.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getSwitchDetail', async ({ switchMac, siteId, customHeaders }) =>
            toToolResult(await client.getSwitchDetail(switchMac, siteId, customHeaders))
        )
    );
}
