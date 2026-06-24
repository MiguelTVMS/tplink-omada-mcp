import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerSearchDevicesTool(server: McpServer, client: OmadaClient): void {
    const inputSchema = z.object({
        searchKey: z.string().min(1, 'searchKey is required'),
        customHeaders: customHeadersSchema,
    });

    server.registerTool(
        'searchDevices',
        {
            description:
                'Search for devices globally across all sites the user has access to. Returns devices matching the search key. The response also includes a siteNames map keyed by siteId — this can be used as a secondary way to discover site IDs (prefer listSites for that purpose).',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('searchDevices', async ({ searchKey, customHeaders }) => toToolResult(await client.searchDevices(searchKey, customHeaders)))
    );
}
