import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = z.object({
    customHeaders: customHeadersSchema.describe(
        'Optional HTTP headers to include in the Omada API request (e.g. {"X-Custom-Header": "value"}). Rarely needed.'
    ),
});

export function registerListSiteTagsTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'listSiteTags',
        {
            description: 'List all site tags configured on the controller.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('listSiteTags', async ({ customHeaders }) => toToolResult(await client.listSiteTags(customHeaders)))
    );
}
