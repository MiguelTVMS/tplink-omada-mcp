import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';
import { createPaginationSchema } from '../utils/pagination-schema.js';

const inputSchema = {
    ...createPaginationSchema(50),
    customHeaders: customHeadersSchema.describe(
        'Optional HTTP headers to include in the Omada API request (e.g. {"X-Custom-Header": "value"}). Rarely needed.'
    ),
};

export function registerListUnknownDevicesTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'listUnknownDevices',
        {
            description: 'List devices detected but not yet adopted. Paginated.',
            inputSchema,
        },
        wrapToolHandler('listUnknownDevices', async ({ page, pageSize, customHeaders }) =>
            toToolResult(await client.listUnknownDevices(page ?? 1, pageSize ?? 50, customHeaders))
        )
    );
}
