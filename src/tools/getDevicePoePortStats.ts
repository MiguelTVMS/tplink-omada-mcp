import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema
    .extend({
        deviceMac: siteInputSchema.shape.siteId
            .unwrap()
            .describe('MAC address of the device (e.g. "AA-BB-CC-DD-EE-FF"). Use listDevices to find device MACs.'),
    })
    .required({ deviceMac: true });

export function registerGetDevicePoePortStatsTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getDevicePoePortStats',
        {
            description: 'Get PoE port statistics for a specific device.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getDevicePoePortStats', async ({ deviceMac, siteId, customHeaders }) =>
            toToolResult(await client.getDevicePoePortStats(deviceMac, siteId, customHeaders))
        )
    );
}
