import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';
import { createPaginationSchema } from '../utils/pagination-schema.js';

export function registerListGlobalEventsTool(server: McpServer, client: OmadaClient): void {
    const inputSchema = z.object({
        ...createPaginationSchema(100),
        startTime: z.number().int().optional().describe('Start time as Unix timestamp in milliseconds'),
        endTime: z.number().int().optional().describe('End time as Unix timestamp in milliseconds'),
        searchKey: z.string().optional().describe('Search keyword for filtering events'),
        customHeaders: customHeadersSchema,
    });

    server.registerTool(
        'listGlobalEvents',
        {
            description: 'List event logs across all sites on the controller, with optional time range and keyword filtering.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('listGlobalEvents', async (args) =>
            toToolResult(
                await client.listGlobalEvents(
                    {
                        page: args.page,
                        pageSize: args.pageSize,
                        startTime: args.startTime,
                        endTime: args.endTime,
                        searchKey: args.searchKey,
                    },
                    args.customHeaders
                )
            )
        )
    );
}
