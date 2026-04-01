import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetClientCorrectionListTool } from '../../src/tools/getClientCorrectionList.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getClientCorrectionList', () => {
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
            getClientCorrectionList: vi.fn(),
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

    it('should register the getClientCorrectionList tool', () => {
        registerGetClientCorrectionListTool(mockServer, mockClient);
        expect(mockServer.registerTool).toHaveBeenCalledWith('getClientCorrectionList', expect.any(Object), expect.any(Function));
    });

    it('should return correction list', async () => {
        const mockResult = { list: [] };
        (mockClient.getClientCorrectionList as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

        registerGetClientCorrectionListTool(mockServer, mockClient);
        const result = await toolHandler({}, { sessionId: 'test' });

        expect(mockClient.getClientCorrectionList).toHaveBeenCalledWith(undefined);
        expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(mockResult, null, 2) }] });
    });

    it('should handle errors', async () => {
        (mockClient.getClientCorrectionList as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
        registerGetClientCorrectionListTool(mockServer, mockClient);
        await expect(toolHandler({}, { sessionId: 'test' })).rejects.toThrow('fail');
    });
});
