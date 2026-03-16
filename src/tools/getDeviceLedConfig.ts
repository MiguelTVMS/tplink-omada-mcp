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

export function registerGetDeviceLedConfigTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getDeviceLedConfig',
        {
            description: 'Get LED configuration for a specific device.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getDeviceLedConfig', async ({ deviceMac, siteId, customHeaders }) =>
            toToolResult(await client.getDeviceLedConfig(deviceMac, siteId, customHeaders))
        )
    );
}
