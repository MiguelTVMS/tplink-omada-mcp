import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const updateClientSchema = z.object({
    siteId: z.string().min(1).optional(),
    clientMac: z.string().min(1, 'clientMac is required'),
    name: z.string().optional().describe('Display name for the client'),
    fixedIp: z.string().optional().describe('Static DHCP IP address'),
    rateLimitEnable: z.boolean().optional().describe('Enable rate limiting'),
    upLimit: z.number().int().optional().describe('Upload rate limit (kbps)'),
    downLimit: z.number().int().optional().describe('Download rate limit (kbps)'),
});

export function registerUpdateClientTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'updateClient',
        {
            description: 'Update client settings such as display name, static IP, and rate limits.',
            inputSchema: updateClientSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('updateClient', async ({ siteId, clientMac, ...data }) => toToolResult(await client.updateClient(clientMac, data, siteId)))
    );
}
