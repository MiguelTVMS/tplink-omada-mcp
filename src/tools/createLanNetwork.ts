import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const dhcpSettingsSchema = z.object({
    enable: z.boolean().describe('Whether DHCP is enabled'),
    ipRangeStart: z.string().min(1).describe('DHCP range start IP (e.g. "192.168.10.100")'),
    ipRangeEnd: z.string().min(1).describe('DHCP range end IP (e.g. "192.168.10.200")'),
    leaseTime: z.number().int().describe('DHCP lease time in seconds'),
});

const createLanNetworkSchema = z.object({
    siteId: z.string().min(1).optional(),
    name: z.string().min(1, 'Network name is required'),
    vlan: z.number().int().describe('VLAN ID'),
    gatewaySubnet: z.string().min(1).describe('Gateway and subnet in CIDR notation (e.g. "192.168.10.1/24")'),
    purpose: z.number().int().describe('Network purpose (1 = interface)'),
    igmpSnoopEnable: z.boolean().describe('Whether IGMP snooping is enabled'),
    dhcpSettings: dhcpSettingsSchema.describe('DHCP server settings'),
});

export function registerCreateLanNetworkTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'createLanNetwork',
        {
            description: 'Create a new LAN network with VLAN, gateway/subnet, and DHCP settings.',
            inputSchema: createLanNetworkSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('createLanNetwork', async ({ siteId, ...data }) => toToolResult(await client.createLanNetwork(data, siteId)))
    );
}
