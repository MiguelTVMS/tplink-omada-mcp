import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';
import { createPaginationSchema } from '../utils/pagination-schema.js';

export function registerListSiteAuditLogsTool(server: McpServer, client: OmadaClient): void {
    const inputSchema = z.object({
        ...createPaginationSchema(100),
        siteId: z.string().min(1).optional(),
        startTime: z.number().int().optional().describe('Start time as Unix timestamp in milliseconds'),
        endTime: z.number().int().optional().describe('End time as Unix timestamp in milliseconds'),
        searchKey: z.string().optional().describe('Search keyword for filtering audit logs'),
        customHeaders: customHeadersSchema,
    });

    server.registerTool(
        'listSiteAuditLogs',
        {
            description: 'List audit logs for a site showing user actions and configuration changes, with optional time range and keyword filtering.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('listSiteAuditLogs', async (args) =>
            toToolResult(
                await client.listSiteAuditLogs(
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
