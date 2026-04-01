import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema
    .extend({
        vpnId: z
            .string()
            .min(1, 'vpnId is required')
            .describe('ID of the client-to-site VPN server. Use listClientToSiteVpnServers to find VPN IDs.'),
    })
    .required({ vpnId: true });

export function registerGetVpnClientsByServerTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getVpnClientsByServer',
        {
            description: 'List VPN clients connected to a specific client-to-site VPN server. Requires siteId and vpnId.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getVpnClientsByServer', async ({ vpnId, siteId, customHeaders }) =>
            toToolResult(await client.getVpnClientsByServer(vpnId, siteId, customHeaders))
        )
    );
}
