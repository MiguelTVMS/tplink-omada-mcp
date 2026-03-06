import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { OmadaClient } from '../omadaClient/index.js';
import { customHeadersSchema, toToolResult, wrapToolHandler } from '../server/common.js';

export function registerGetGernalSettingsTool(server: McpServer, client: OmadaClient): void {
    const description = 'Get the global general settings for the Omada controller, including controller name, language, and discovery options.';
    const inputShape = z.object({ customHeaders: customHeadersSchema }).shape;

    // Original operationId name (preserved for OpenAPI parity / backwards compatibility)
    server.registerTool(
        'getGernalSettings',
        { description, inputSchema: inputShape },
        wrapToolHandler('getGernalSettings', async ({ customHeaders }) => toToolResult(await client.getGernalSettings(customHeaders)))
    );

    // Correctly-spelled alias for consumer convenience
    server.registerTool(
        'getGeneralSettings',
        { description, inputSchema: inputShape },
        wrapToolHandler('getGeneralSettings', async ({ customHeaders }) => toToolResult(await client.getGernalSettings(customHeaders)))
    );
}
