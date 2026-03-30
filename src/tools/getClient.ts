import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { clientIdSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerGetClientTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getClient',
        {
            description:
                '[DEPRECATED] Prefer getClientDetail when you have a client MAC, or listClients to resolve clients by id/mac. This tool filters the site client list in-process to emulate a per-client lookup. Fetch details for a specific Omada client.',
            inputSchema: clientIdSchema.shape,
        },
        wrapToolHandler('getClient', async ({ clientId, siteId, customHeaders }) =>
            toToolResult(await client.getClient(clientId, siteId, customHeaders))
        )
    );
}
