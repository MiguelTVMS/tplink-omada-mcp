import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = z.object({
    customHeaders: customHeadersSchema.describe(
        'Optional HTTP headers to include in the Omada API request (e.g. {"X-Custom-Header": "value"}). Rarely needed.'
    ),
});

export function registerGetControllerDstInfoTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getControllerDstInfo',
        {
            description: 'Get DST (Daylight Saving Time) and timezone information for the controller.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getControllerDstInfo', async ({ customHeaders }) => toToolResult(await client.getControllerDstInfo(customHeaders)))
    );
}
