import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { deviceMacSchema, siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema
    .extend({
        deviceMac: deviceMacSchema.describe('MAC address of the device (e.g. "AA-BB-CC-DD-EE-FF"). Use listDevices to find device MACs.'),
    })
    .required({ deviceMac: true });

export function registerGetDeviceAdoptResultTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getDeviceAdoptResult',
        {
            description: 'Get the result of a device adoption operation for a deviceMac at an optional/defaulted siteId.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getDeviceAdoptResult', async ({ deviceMac, siteId, customHeaders }) =>
            toToolResult(await client.getDeviceAdoptResult(deviceMac, siteId, customHeaders))
        )
    );
}
