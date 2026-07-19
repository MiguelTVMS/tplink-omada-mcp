import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const setGatewayWanConnectSchema = z.object({
    siteId: z.string().min(1).optional(),
    gatewayMac: z.string().min(1, 'gatewayMac is required'),
    portId: z.string().min(1, 'portId is required'),
    action: z.enum(['connect', 'disconnect']).describe('Whether to connect or disconnect the WAN port'),
});

export function registerSetGatewayWanConnectTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'setGatewayWanConnect',
        {
            description: 'Connect or disconnect a gateway WAN port.',
            inputSchema: setGatewayWanConnectSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('setGatewayWanConnect', async ({ gatewayMac, portId, action, siteId }) =>
            toToolResult(await client.setGatewayWanConnect(gatewayMac, portId, action, siteId))
        )
    );
}
