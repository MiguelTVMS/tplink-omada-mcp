import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = z.object({
    userID: z.string().min(1, 'userID is required').describe('ID of the controller user to retrieve.'),
    customHeaders: customHeadersSchema.describe(
        'Optional HTTP headers to include in the Omada API request (e.g. {"X-Custom-Header": "value"}). Rarely needed.'
    ),
});

export function registerGetControllerUserTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getControllerUser',
        {
            description: 'Get details for a specific controller user. Requires userID.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getControllerUser', async ({ userID, customHeaders }) => toToolResult(await client.getControllerUser(userID, customHeaders)))
    );
}
