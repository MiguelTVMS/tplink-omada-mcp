import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerListSiteInternetModelsTool } from '../../src/tools/listSiteInternetModels.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/listSiteInternetModels', () => {
    let mockServer: McpServer;
    let mockClient: OmadaClient;
    let toolHandler: (args: unknown, extra: { sessionId?: string }) => Promise<unknown>;

    beforeEach(() => {
        mockServer = {
            registerTool: vi.fn((name, schema, handler) => {
                toolHandler = handler;
            }),
        } as unknown as McpServer;

        mockClient = {
            listSiteInternetModels: vi.fn(),
        } as unknown as OmadaClient;

        vi.spyOn(loggerModule.logger, 'info').mockImplementation(() => {
            // Mock implementation
        });
        vi.spyOn(loggerModule.logger, 'error').mockImplementation(() => {
            // Mock implementation
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should register the listSiteInternetModels tool', () => {
        registerListSiteInternetModelsTool(mockServer, mockClient);
        expect(mockServer.registerTool).toHaveBeenCalledWith('listSiteInternetModels', expect.any(Object), expect.any(Function));
    });

    it('should call client with siteId', async () => {
        const mockResult = [{ model: 'DHCP' }, { model: 'PPPoE' }];
        (mockClient.listSiteInternetModels as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

        registerListSiteInternetModelsTool(mockServer, mockClient);
        const result = await toolHandler({ siteId: 'site1' }, { sessionId: 'test' });

        expect(mockClient.listSiteInternetModels).toHaveBeenCalledWith('site1', undefined);
        expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(mockResult, null, 2) }] });
    });

    it('should handle errors', async () => {
        (mockClient.listSiteInternetModels as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
        registerListSiteInternetModelsTool(mockServer, mockClient);
        await expect(toolHandler({}, { sessionId: 'test' })).rejects.toThrow('fail');
    });
});
