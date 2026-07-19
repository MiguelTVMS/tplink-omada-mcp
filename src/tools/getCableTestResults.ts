import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const getCableTestResultsSchema = z.object({
    siteId: z.string().min(1).optional(),
    switchMac: z.string().min(1, 'switchMac is required'),
});

export function registerGetCableTestResultsTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getCableTestResults',
        {
            description: 'Get cable test results for a switch. Run startCableTest first.',
            inputSchema: getCableTestResultsSchema.shape,
        },
        wrapToolHandler('getCableTestResults', async ({ switchMac, siteId }) => toToolResult(await client.getCableTestResults(switchMac, siteId)))
    );
}
