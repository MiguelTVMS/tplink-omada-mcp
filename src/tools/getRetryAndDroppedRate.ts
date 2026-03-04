import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

const inputSchema = siteInputSchema.extend({
    start: z
        .number()
        .int()
        .positive()
        .describe(
            'Start of the time range as a Unix timestamp in milliseconds (e.g. Date.now() - 3600000 for the last hour). Must be paired with end.'
        ),
    end: z
        .number()
        .int()
        .positive()
        .describe('End of the time range as a Unix timestamp in milliseconds (e.g. Date.now()). Must be paired with start.'),
});

export function registerGetRetryAndDroppedRateTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getRetryAndDroppedRate',
        {
            description:
                'Get wireless retry rate and dropped packet rate over a time range. High retry rates indicate RF interference or weak signal; high drop rates indicate capacity or hardware issues. Useful for diagnosing WiFi quality problems.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getRetryAndDroppedRate', async ({ siteId, start, end, customHeaders }) =>
            toToolResult(await client.getRetryAndDroppedRate(siteId, start, end, customHeaders))
        )
    );
}
