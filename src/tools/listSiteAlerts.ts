import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';
import { createPaginationSchema } from '../utils/pagination-schema.js';

export function registerListSiteAlertsTool(server: McpServer, client: OmadaClient): void {
    const inputSchema = z.object({
        ...createPaginationSchema(100),
        siteId: z.string().min(1).optional(),
        startTime: z.number().int().optional().describe('Start time as Unix timestamp in milliseconds'),
        endTime: z.number().int().optional().describe('End time as Unix timestamp in milliseconds'),
        searchKey: z.string().optional().describe('Search keyword for filtering alerts'),
        customHeaders: customHeadersSchema,
    });

    server.registerTool(
        'listSiteAlerts',
        {
            description: 'List alert logs for a site, with optional time range and keyword filtering.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('listSiteAlerts', async (args) =>
            toToolResult(
                await client.listSiteAlerts(
                    {
                        page: args.page,
                        pageSize: args.pageSize,
                        startTime: args.startTime,
                        endTime: args.endTime,
                        searchKey: args.searchKey,
                    },
                    args.siteId,
                    args.customHeaders
                )
            )
        )
    );
}
