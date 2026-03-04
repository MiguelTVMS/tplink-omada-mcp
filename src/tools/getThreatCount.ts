import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerGetThreatCountTool(server: McpServer, client: OmadaClient): void {
    const inputSchema = z.object({
        customHeaders: customHeadersSchema,
    });

    server.registerTool(
        'getThreatCount',
        {
            description:
                'Get the global threat count grouped by severity level (e.g. critical, high, medium, low). Provides a summary view of the current threat landscape across all sites.',
            inputSchema: inputSchema.shape,
        },
        wrapToolHandler('getThreatCount', async ({ customHeaders }) => toToolResult(await client.getThreatSeverity(customHeaders)))
    );
}
