import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerGetAttackDefenseDefaultsTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getAttackDefenseDefaults',
        {
            description: 'Get default attack defense settings for the site.',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('getAttackDefenseDefaults', async ({ siteId, customHeaders }) =>
            toToolResult(await client.getAttackDefenseDefaults(siteId, customHeaders))
        )
    );
}
