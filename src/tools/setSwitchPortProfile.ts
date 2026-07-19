import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const setSwitchPortProfileSchema = z.object({
    siteId: z.string().min(1).optional(),
    switchMac: z.string().min(1, 'switchMac is required'),
    port: z.number().int().min(1, 'port number is required'),
    profileId: z.string().min(1, 'profileId is required'),
});

export function registerSetSwitchPortProfileTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'setSwitchPortProfile',
        {
            description: 'Assign a LAN profile to a single switch port.',
            inputSchema: setSwitchPortProfileSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('setSwitchPortProfile', async ({ switchMac, port, profileId, siteId }) =>
            toToolResult(await client.setSwitchPortProfile(switchMac, port, profileId, siteId))
        )
    );
}
