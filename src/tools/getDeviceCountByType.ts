import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerGetDeviceCountByTypeTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'getDeviceCountByType',
        {
            description: 'Get the count of devices grouped by type (AP, switch, gateway) in a site.',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('getDeviceCountByType', async ({ siteId, customHeaders }) =>
            toToolResult(await client.getDeviceCountByType(siteId, customHeaders))
        )
    );
}
