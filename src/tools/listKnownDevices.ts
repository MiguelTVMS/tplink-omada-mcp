import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = z.object({
    customHeaders: customHeadersSchema.describe(
        'Optional HTTP headers to include in the Omada API request (e.g. {"X-Custom-Header": "value"}). Rarely needed.'
    ),
});

export function registerListKnownDevicesTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'listKnownDevices',
        {
            description: 'List all known (previously seen) devices on the controller.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('listKnownDevices', async ({ customHeaders }) => toToolResult(await client.listKnownDevices(customHeaders)))
    );
}
