import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = z.object({
    upgradeLogId: z
        .string()
        .min(1, 'upgradeLogId is required')
        .describe('ID of the firmware upgrade log entry. Use getUpgradeLogs to find upgrade log IDs.'),
    customHeaders: customHeadersSchema.describe(
        'Optional HTTP headers to include in the Omada API request (e.g. {"X-Custom-Header": "value"}). Rarely needed.'
    ),
});

export function registerListUpgradeFailedDevicesTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'listUpgradeFailedDevices',
        {
            description: 'List devices that failed during a firmware upgrade task. Requires upgradeLogId.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('listUpgradeFailedDevices', async ({ upgradeLogId, customHeaders }) =>
            toToolResult(await client.listUpgradeFailedDevices(upgradeLogId, customHeaders))
        )
    );
}
