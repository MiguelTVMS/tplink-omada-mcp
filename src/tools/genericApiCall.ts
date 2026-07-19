import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const genericApiCallSchema = z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
    path: z.string().min(1, 'path is required (e.g. /sites/{siteId}/setting/firewall/acls)'),
    version: z.enum(['v1', 'v2']).optional().default('v1'),
    body: z.record(z.unknown()).optional(),
    queryParams: z.record(z.unknown()).optional(),
});

export function registerGenericApiCallTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'genericApiCall',
        {
            description:
                'Execute an arbitrary Omada API call. Use this for any endpoint not covered by other tools. ' +
                'Path is relative (e.g. "/sites/{siteId}/setting/firewall/acls"). ' +
                'The omadacId prefix is added automatically.',
            inputSchema: genericApiCallSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('genericApiCall', async ({ method, path, version, body, queryParams }) =>
            toToolResult(await client.genericApiCall(method, path, version, body, queryParams))
        )
    );
}
