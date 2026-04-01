import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';
import { createPaginationSchema } from '../utils/pagination-schema.js';

const inputSchema = {
    ...createPaginationSchema(100),
    customHeaders: customHeadersSchema.describe(
        'Optional HTTP headers to include in the Omada API request (e.g. {"X-Custom-Header": "value"}). Rarely needed.'
    ),
};

export function registerGetDevicesInfoTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getDevicesInfo',
        {
            description: 'Get batch info for all adopted devices across the controller.',
            inputSchema,
        },
        wrapToolHandler('getDevicesInfo', async ({ page, pageSize, customHeaders }) =>
            toToolResult(await client.getDevicesInfo(page ?? 1, pageSize ?? 100, customHeaders))
        )
    );
}
