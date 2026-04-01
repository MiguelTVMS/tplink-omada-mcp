import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { deviceMacSchema, siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema
    .extend({
        deviceMac: deviceMacSchema.describe('MAC address of the device (e.g. "AA-BB-CC-DD-EE-FF"). Use listDevices to find device MACs.'),
    })
    .required({ deviceMac: true });

export function registerGetDeviceOnlineUpgradeResultTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getDeviceOnlineUpgradeResult',
        {
            description: 'Get the result of an online firmware upgrade for a device. Requires deviceMac; siteId is optional and may default.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getDeviceOnlineUpgradeResult', async ({ deviceMac, siteId, customHeaders }) =>
            toToolResult(await client.getDeviceOnlineUpgradeResult(deviceMac, siteId, customHeaders))
        )
    );
}
