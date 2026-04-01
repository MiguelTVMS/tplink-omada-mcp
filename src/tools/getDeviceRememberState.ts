import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { deviceMacSchema, siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema
    .extend({
        deviceMac: deviceMacSchema.describe('MAC address of the device (e.g. "AA-BB-CC-DD-EE-FF"). Use listDevices to find device MACs.'),
    })
    .required({ deviceMac: true });

export function registerGetDeviceRememberStateTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getDeviceRememberState',
        {
            description: 'Get the remember state for a specific device. Requires deviceMac; siteId is optional (may be defaulted).',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getDeviceRememberState', async ({ deviceMac, siteId, customHeaders }) =>
            toToolResult(await client.getDeviceRememberState(deviceMac, siteId, customHeaders))
        )
    );
}
