import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const updateSwitchPortSchema = z.object({
    siteId: z.string().min(1).optional(),
    switchMac: z.string().min(1, 'switchMac is required'),
    portId: z.string().min(1, 'portId is required'),
    profileId: z.string().min(1).optional().describe('LAN profile ID to assign'),
    poe: z.boolean().optional().describe('Enable or disable PoE'),
    bandwidthLimitMode: z.number().int().optional().describe('Bandwidth limit mode'),
    linkSpeed: z.number().int().optional().describe('Link speed setting'),
    duplex: z.number().int().optional().describe('Duplex mode'),
    spanningTreeEnable: z.boolean().optional().describe('Enable Spanning Tree Protocol'),
    portIsolationEnable: z.boolean().optional().describe('Enable port isolation'),
    loopbackDetectEnable: z.boolean().optional().describe('Enable loopback detection'),
    lldpMedEnable: z.boolean().optional().describe('Enable LLDP-MED'),
});

export function registerUpdateSwitchPortTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'updateSwitchPort',
        {
            description: 'Update a switch port configuration (profile, PoE, speed, STP, isolation, etc.).',
            inputSchema: updateSwitchPortSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('updateSwitchPort', async ({ siteId, switchMac, portId, ...data }) =>
            toToolResult(await client.updateSwitchPort(switchMac, portId, data, siteId))
        )
    );
}
