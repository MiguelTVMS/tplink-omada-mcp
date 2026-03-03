import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema
    .extend({
        apMac: siteInputSchema.shape.siteId.unwrap().describe('MAC address of the access point'),
    })
    .required({ apMac: true });

export function registerGetApRadiosTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getApRadios',
        {
            description: 'Get radio configuration and status for a specific access point (AP), including channel, power, and band information.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getApRadios', async ({ apMac, siteId, customHeaders }) =>
            toToolResult(await client.getApRadios(apMac, siteId, customHeaders))
        )
    );
}
