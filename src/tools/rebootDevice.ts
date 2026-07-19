import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const rebootDeviceSchema = z.object({
    siteId: z.string().min(1).optional(),
    deviceMac: z.string().min(1, 'deviceMac is required'),
});

export function registerRebootDeviceTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'rebootDevice',
        {
            description: 'Reboot a network device by its MAC address.',
            inputSchema: rebootDeviceSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('rebootDevice', async ({ deviceMac, siteId }) => toToolResult(await client.rebootDevice(deviceMac, siteId)))
    );
}
