import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const updateLanProfileSchema = z.object({
    siteId: z.string().min(1).optional(),
    profileId: z.string().min(1, 'profileId is required'),
    name: z.string().min(1, 'Profile name is required'),
    nativeNetworkId: z.string().min(1).describe('Native (untagged) network ID'),
    tagNetworkIds: z.array(z.string().min(1)).describe('Tagged network IDs'),
    poe: z.boolean().describe('Whether PoE is enabled'),
    spanningTreeEnable: z.boolean().describe('Whether Spanning Tree Protocol is enabled'),
    loopbackDetectEnable: z.boolean().describe('Whether loopback detection is enabled'),
    portIsolationEnable: z.boolean().describe('Whether port isolation is enabled'),
    lldpMedEnable: z.boolean().describe('Whether LLDP-MED is enabled'),
});

export function registerUpdateLanProfileTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'updateLanProfile',
        {
            description: 'Update an existing LAN profile configuration including network assignments and port settings.',
            inputSchema: updateLanProfileSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('updateLanProfile', async ({ siteId, profileId, ...data }) =>
            toToolResult(await client.updateLanProfile(profileId, data, siteId))
        )
    );
}
