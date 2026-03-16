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

export function registerGetApStpConfigTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getApStpConfig',
        {
            description: 'Get STP configuration for a specific access point.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getApStpConfig', async ({ apMac, siteId, customHeaders }) =>
            toToolResult(await client.getApStpConfig(apMac, siteId, customHeaders))
        )
    );
}
