import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const startFirmwareUpgradeSchema = z.object({
    siteId: z.string().min(1).optional(),
    deviceMac: z.string().min(1, 'deviceMac is required'),
});

export function registerStartFirmwareUpgradeTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'startFirmwareUpgrade',
        {
            description: 'Start a firmware upgrade for a device. Use getFirmwareDetails first to check for available updates.',
            inputSchema: startFirmwareUpgradeSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('startFirmwareUpgrade', async ({ deviceMac, siteId }) => toToolResult(await client.startFirmwareUpgrade(deviceMac, siteId)))
    );
}
