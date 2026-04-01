import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = z.object({
    page: z.number().int().min(1).default(1).describe('Page number for paginated results (1-based). Defaults to 1.'),
    pageSize: z.number().int().min(1).max(200).default(100).describe('Number of results per page. Defaults to 100.'),
    customHeaders: customHeadersSchema.describe(
        'Optional HTTP headers to include in the Omada API request (e.g. {"X-Custom-Header": "value"}). Rarely needed.'
    ),
});

export function registerGetDevicesInfoTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getDevicesInfo',
        {
            description: 'Get batch info for all adopted devices across the controller.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getDevicesInfo', async ({ page, pageSize, customHeaders }) =>
            toToolResult(await client.getDevicesInfo(page, pageSize, customHeaders))
        )
    );
}
