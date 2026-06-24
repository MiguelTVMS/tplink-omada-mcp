import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerListSitesTool(server: McpServer, client: OmadaClient): void {
    const inputSchema = z.object({
        customHeaders: customHeadersSchema,
    });

    server.registerTool(
        'listSites',
        {
            description:
                "List all sites on the Omada controller. Returns each site's siteId and name. Call this first — the siteId value is required by most other tools. Without it, site-scoped tools will fail unless OMADA_SITE_ID is set in the environment.",
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('listSites', async ({ customHeaders }) => toToolResult(await client.listSites(customHeaders)))
    );
}
