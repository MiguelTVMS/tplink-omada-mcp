import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerGetGlobalThreatCountTool(server: McpServer, client: OmadaClient): void {
    const inputSchema = z.object({
        startTime: z.number().int().describe('Start of the time range as Unix epoch seconds.'),
        endTime: z.number().int().describe('End of the time range as Unix epoch seconds.'),
        customHeaders: customHeadersSchema,
    });

    server.registerTool(
        'getGlobalThreatCount',
        {
            description:
                'Get the global threat count broken down by severity for a given time range. Returns counts of low/medium/high/critical threats detected by the global IPS engine. Requires startTime and endTime as Unix epoch seconds.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getGlobalThreatCount', async ({ startTime, endTime, customHeaders }) =>
            toToolResult(await client.getGlobalThreatCount(startTime, endTime, customHeaders))
        )
    );
}
