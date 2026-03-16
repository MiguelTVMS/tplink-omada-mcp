import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema
    .extend({
        apMac: siteInputSchema.shape.siteId
            .unwrap()
            .describe('MAC address of the access point (e.g. "AA-BB-CC-DD-EE-FF"). Use listDevices to find AP MACs.'),
    })
    .required({ apMac: true });

export function registerGetApPoEConfigTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getApPoEConfig',
        {
            description: 'Get PoE configuration for a specific access point.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getApPoEConfig', async ({ apMac, siteId, customHeaders }) =>
            toToolResult(await client.getApPoEConfig(apMac, siteId, customHeaders))
        )
    );
}
