import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const batchSetSwitchPortNameSchema = z.object({
    siteId: z.string().min(1).optional(),
    switchMac: z.string().min(1, 'switchMac is required'),
    portNameList: z
        .array(
            z.object({
                port: z.number().int().min(1),
                name: z.string().min(1).max(128),
            })
        )
        .min(1, 'portNameList must contain at least one entry'),
});

export function registerBatchSetSwitchPortNameTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'batchSetSwitchPortName',
        {
            description: 'Batch set names on multiple switch ports. Each entry specifies a port number and name (1-128 chars).',
            inputSchema: batchSetSwitchPortNameSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('batchSetSwitchPortName', async ({ switchMac, portNameList, siteId }) =>
            toToolResult(await client.batchSetSwitchPortName(switchMac, portNameList, siteId))
        )
    );
}
