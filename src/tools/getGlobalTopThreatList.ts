import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerGetGlobalTopThreatListTool(server: McpServer, client: OmadaClient): void {
    const inputSchema = z.object({
        startTime: z.number().int().describe('Start of the time range as Unix epoch seconds.'),
        endTime: z.number().int().describe('End of the time range as Unix epoch seconds.'),
        customHeaders: customHeadersSchema,
    });

    server.registerTool(
        'getGlobalTopThreatList',
        {
            description:
                'Get the top global threats across all sites for a given time range. Returns the most frequently detected threats by the global IPS engine. Requires startTime and endTime as Unix epoch seconds.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getGlobalTopThreatList', async ({ startTime, endTime, customHeaders }) =>
            toToolResult(await client.getGlobalTopThreatList(startTime, endTime, customHeaders))
        )
    );
}
