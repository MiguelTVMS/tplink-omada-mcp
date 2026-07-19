import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const setSwitchPortNameSchema = z.object({
    siteId: z.string().min(1).optional(),
    switchMac: z.string().min(1, 'switchMac is required'),
    port: z.number().int().min(1, 'port number is required'),
    name: z.string().min(1).max(128, 'name must be 1-128 characters'),
});

export function registerSetSwitchPortNameTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'setSwitchPortName',
        {
            description: 'Set the name of a single switch port (1-128 characters).',
            inputSchema: setSwitchPortNameSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('setSwitchPortName', async ({ switchMac, port, name, siteId }) =>
            toToolResult(await client.setSwitchPortName(switchMac, port, name, siteId))
        )
    );
}
