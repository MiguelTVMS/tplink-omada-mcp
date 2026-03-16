import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema
    .extend({
        apMac: siteInputSchema.shape.siteId
            .unwrap()
            .describe('MAC address of the access point (e.g. "AA-BB-CC-DD-EE-FF"). Use listDevices to find AP MACs.'),
    })
    .required({ apMac: true });

export function registerGetApBeaconConfigTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getApBeaconConfig',
        {
            description: 'Get beacon configuration for a specific access point.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getApBeaconConfig', async ({ apMac, siteId, customHeaders }) =>
            toToolResult(await client.getApBeaconConfig(apMac, siteId, customHeaders))
        )
    );
}
