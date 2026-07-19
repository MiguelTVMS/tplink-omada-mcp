import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const listLogsSchema = z.object({
    siteId: z.string().min(1).optional(),
    page: z.number().int().min(1).optional().default(1).describe('Page number (default: 1)'),
    pageSize: z.number().int().min(1).max(1000).optional().default(10).describe('Page size (default: 10, max: 1000)'),
});

export function registerListLogsTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'listLogs',
        {
            description: 'List paginated logs for a site (system logs, configuration changes).',
            inputSchema: listLogsSchema.shape,
        },
        wrapToolHandler('listLogs', async ({ siteId, page, pageSize }) => toToolResult(await client.listLogs(siteId, page, pageSize)))
    );
}
