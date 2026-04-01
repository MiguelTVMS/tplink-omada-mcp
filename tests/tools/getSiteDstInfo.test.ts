import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetSiteDstInfoTool } from '../../src/tools/getSiteDstInfo.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getSiteDstInfo', () => {
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
            getSiteDstInfo: vi.fn(),
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

    it('should register the getSiteDstInfo tool', () => {
        registerGetSiteDstInfoTool(mockServer, mockClient);
        expect(mockServer.registerTool).toHaveBeenCalledWith('getSiteDstInfo', expect.any(Object), expect.any(Function));
    });

    it('should call client with siteId', async () => {
        const mockResult = { timezone: 'America/New_York', dst: true };
        (mockClient.getSiteDstInfo as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

        registerGetSiteDstInfoTool(mockServer, mockClient);
        const result = await toolHandler({ siteId: 'site1' }, { sessionId: 'test' });

        expect(mockClient.getSiteDstInfo).toHaveBeenCalledWith('site1', undefined);
        expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(mockResult, null, 2) }] });
    });

    it('should handle errors', async () => {
        (mockClient.getSiteDstInfo as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
        registerGetSiteDstInfoTool(mockServer, mockClient);
        await expect(toolHandler({}, { sessionId: 'test' })).rejects.toThrow('fail');
    });
});
