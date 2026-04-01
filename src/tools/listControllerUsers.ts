import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = z.object({
    customHeaders: customHeadersSchema.describe(
        'Optional HTTP headers to include in the Omada API request (e.g. {"X-Custom-Header": "value"}). Rarely needed.'
    ),
});

export function registerListControllerUsersTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'listControllerUsers',
        {
            description: 'List all users configured on the controller.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('listControllerUsers', async ({ customHeaders }) => toToolResult(await client.listControllerUsers(customHeaders)))
    );
}
