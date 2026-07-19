import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { OmadaClient } from '../omadaClient/index.js';
import { siteInputSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerListIpGroupsTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'listIpGroups',
        {
            description:
                'List IP/port groups configured in a site. Groups can be used in firewall ACL rules. ' +
                'Requires the internal web UI API (OMADA_WEB_USERNAME/OMADA_WEB_PASSWORD).',
            inputSchema: siteInputSchema.shape,
        },
        wrapToolHandler('listIpGroups', async ({ siteId }) => toToolResult(await client.listIpGroups(siteId)))
    );
}
