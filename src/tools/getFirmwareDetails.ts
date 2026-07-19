import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const getFirmwareDetailsSchema = z.object({
    siteId: z.string().min(1).optional(),
    deviceMac: z.string().min(1, 'deviceMac is required'),
});

export function registerGetFirmwareDetailsTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getFirmwareDetails',
        {
            description: 'Get firmware information for a device including current version and available updates.',
            inputSchema: getFirmwareDetailsSchema.shape,
        },
        wrapToolHandler('getFirmwareDetails', async ({ deviceMac, siteId }) => toToolResult(await client.getFirmwareDetails(deviceMac, siteId)))
    );
}
