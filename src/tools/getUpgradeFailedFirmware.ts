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

export function registerGetUpgradeFailedFirmwareTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getUpgradeFailedFirmware',
        {
            description: 'Get failed firmware info for a firmware upgrade log entry. Requires upgradeLogId.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getUpgradeFailedFirmware', async ({ upgradeLogId, customHeaders }) =>
            toToolResult(await client.getUpgradeFailedFirmware(upgradeLogId, customHeaders))
        )
    );
}
