import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const setDeviceLedSchema = z.object({
    siteId: z.string().min(1).optional(),
    deviceMac: z.string().min(1, 'deviceMac is required'),
    ledSetting: z.number().int().min(0).max(2).describe('LED setting: 0=off, 1=on, 2=site-default'),
});

export function registerSetDeviceLedTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'setDeviceLed',
        {
            description: 'Set the LED on/off/site-default for a device by its MAC address.',
            inputSchema: setDeviceLedSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('setDeviceLed', async ({ deviceMac, ledSetting, siteId }) =>
            toToolResult(await client.setDeviceLed(deviceMac, ledSetting, siteId))
        )
    );
}
