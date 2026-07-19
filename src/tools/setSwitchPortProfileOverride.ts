import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const setSwitchPortProfileOverrideSchema = z.object({
    siteId: z.string().min(1).optional(),
    switchMac: z.string().min(1, 'switchMac is required'),
    port: z.number().int().min(1, 'port number is required'),
    profileOverrideEnable: z.boolean().describe('Enable or disable profile override'),
});

export function registerSetSwitchPortProfileOverrideTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'setSwitchPortProfileOverride',
        {
            description: 'Enable or disable profile override on a single switch port.',
            inputSchema: setSwitchPortProfileOverrideSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('setSwitchPortProfileOverride', async ({ switchMac, port, profileOverrideEnable, siteId }) =>
            toToolResult(await client.setSwitchPortProfileOverride(switchMac, port, profileOverrideEnable, siteId))
        )
    );
}
