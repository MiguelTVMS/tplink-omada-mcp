import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { toToolResult, wrapToolHandler } from '../server/common.js';

const updateFirewallSettingSchema = z.object({
    siteId: z.string().min(1).optional(),
    settings: z.record(z.unknown()).describe('Firewall settings object (same shape returned by getFirewallSetting)'),
});

export function registerUpdateFirewallSettingTool(server: McpServer, client: OmadaClient): void {
    server.registerTool(
        'updateFirewallSetting',
        {
            description:
                'Update firewall settings for a site. Pass the same shape returned by getFirewallSetting ' +
                '(broadcastPing, sendRedirects, synCookies, etc.).',
            inputSchema: updateFirewallSettingSchema.shape,
            annotations: {
                destructiveHint: true,
            },
        },
        wrapToolHandler('updateFirewallSetting', async ({ siteId, settings }) => toToolResult(await client.updateFirewallSetting(settings, siteId)))
    );
}
