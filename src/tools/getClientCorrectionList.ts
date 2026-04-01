import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = z.object({
    customHeaders: customHeadersSchema.describe(
        'Optional HTTP headers to include in the Omada API request (e.g. {"X-Custom-Header": "value"}). Rarely needed.'
    ),
});

export function registerGetClientCorrectionListTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getClientCorrectionList',
        {
            description: 'Get the client correction list for the controller.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getClientCorrectionList', async ({ customHeaders }) => toToolResult(await client.getClientCorrectionList(customHeaders)))
    );
}
