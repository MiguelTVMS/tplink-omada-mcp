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

export function registerListKnownDevicesTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'listKnownDevices',
        {
            description: 'List all known (previously seen) devices on the controller.',
            inputSchema,
        },
        wrapToolHandler('listKnownDevices', async ({ page, pageSize, customHeaders }) =>
            toToolResult(await client.listKnownDevices(page ?? 1, pageSize ?? 50, customHeaders))
        )
    );
}
