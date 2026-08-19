import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';
import { createPaginationSchema } from '../utils/pagination-schema.js';

export function registerListSiteAlertsTool(server: McpServer, client: OmadaClient): void {
    const inputSchema = z.object({
        ...createPaginationSchema(100),
        siteId: z
            .string()
            .min(1)
            .optional()
            .describe('Site ID to target. If omitted, uses the default site from OMADA_SITE_ID config. Use listSites to discover site IDs.'),
        startTime: z
            .number()
            .int()
            .describe(
                'Filter alerts after this time. Unix timestamp in milliseconds (e.g. Date.now() - 86400000 for last 24h). Required by the Omada API.'
            ),
        endTime: z
            .number()
            .int()
            .describe('Filter alerts before this time. Unix timestamp in milliseconds (e.g. Date.now()). Required by the Omada API.'),
        searchKey: z.string().optional().describe('Keyword to filter alerts by description or device name.'),
        customHeaders: customHeadersSchema,
    });

    server.registerTool(
        'listSiteAlerts',
        {
            description:
                'List alert logs for a site: threshold breaches, device failures, security events, and other conditions requiring attention. Returns alert type, severity, device, and timestamp. startTime and endTime are required by the Omada API.',
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
