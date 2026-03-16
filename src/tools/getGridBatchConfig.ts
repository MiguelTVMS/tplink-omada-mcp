import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';
import { createPaginationSchema } from '../utils/pagination-schema.js';

const inputSchema = { ...createPaginationSchema(), customHeaders: customHeadersSchema };

export function registerGetGridBatchConfigTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getGridBatchConfig',
        {
            description: 'Get the batch configuration list for bulk device configuration operations.',
            inputSchema,
        },
        wrapToolHandler('getGridBatchConfig', async ({ page, pageSize, customHeaders }) =>
            toToolResult(await client.getGridBatchConfig(page ?? 1, pageSize ?? 10, customHeaders))
        )
    );
}
