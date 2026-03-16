import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';
import { createPaginationSchema } from '../utils/pagination-schema.js';

const inputSchema = { ...createPaginationSchema(), customHeaders: customHeadersSchema };

export function registerGetUpgradePlanListTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getUpgradePlanList',
        {
            description: 'Get the list of scheduled firmware upgrade plans across all devices.',
            inputSchema,
        },
        wrapToolHandler('getUpgradePlanList', async ({ page, pageSize, customHeaders }) =>
            toToolResult(await client.getUpgradePlanList(page ?? 1, pageSize ?? 10, customHeaders))
        )
    );
}
