import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const startCableTestSchema = z.object({
    siteId: z.string().min(1).optional(),
    switchMac: z.string().min(1, 'switchMac is required'),
});

export function registerStartCableTestTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'startCableTest',
        {
            description: 'Start a cable test on a switch. Use getCableTestResults to retrieve results after completion.',
            inputSchema: startCableTestSchema.shape,
        },
        wrapToolHandler('startCableTest', async ({ switchMac, siteId }) => toToolResult(await client.startCableTest(switchMac, siteId)))
    );
}
