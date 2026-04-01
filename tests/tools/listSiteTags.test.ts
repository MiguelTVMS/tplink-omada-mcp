import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerListSiteTagsTool } from '../../src/tools/listSiteTags.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/listSiteTags', () => {
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
            listSiteTags: vi.fn(),
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

    it('should register the listSiteTags tool', () => {
        registerListSiteTagsTool(mockServer, mockClient);
        expect(mockServer.registerTool).toHaveBeenCalledWith('listSiteTags', expect.any(Object), expect.any(Function));
    });

    it('should return site tags', async () => {
        const mockResult = [{ tagId: '1', name: 'prod' }];
        (mockClient.listSiteTags as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

        registerListSiteTagsTool(mockServer, mockClient);
        const result = await toolHandler({}, { sessionId: 'test' });

        expect(mockClient.listSiteTags).toHaveBeenCalledWith(undefined);
        expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(mockResult, null, 2) }] });
    });

    it('should handle errors', async () => {
        (mockClient.listSiteTags as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
        registerListSiteTagsTool(mockServer, mockClient);
        await expect(toolHandler({}, { sessionId: 'test' })).rejects.toThrow('fail');
    });
});
