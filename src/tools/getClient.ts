import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { clientIdSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerGetClientTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getClient',
        {
            description:
                '[DEPRECATED] Use listClients instead. Filters the site client list in-process. No dedicated per-client detail endpoint exists in the spec. Fetch details for a specific Omada client.',
            inputSchema: clientIdSchema.shape,
        },
        wrapToolHandler('getClient', async ({ clientId, siteId, customHeaders }) =>
            toToolResult(await client.getClient(clientId, siteId, customHeaders))
        )
    );
}
