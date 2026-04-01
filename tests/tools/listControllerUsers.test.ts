import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerListControllerUsersTool } from '../../src/tools/listControllerUsers.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/listControllerUsers', () => {
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
            listControllerUsers: vi.fn(),
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

    it('should register the listControllerUsers tool', () => {
        registerListControllerUsersTool(mockServer, mockClient);
        expect(mockServer.registerTool).toHaveBeenCalledWith('listControllerUsers', expect.any(Object), expect.any(Function));
    });

    it('should return controller users', async () => {
        const mockResult = [{ id: 'u1', username: 'admin' }];
        (mockClient.listControllerUsers as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

        registerListControllerUsersTool(mockServer, mockClient);
        const result = await toolHandler({}, { sessionId: 'test' });

        expect(mockClient.listControllerUsers).toHaveBeenCalledWith(undefined);
        expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(mockResult, null, 2) }] });
    });

    it('should handle errors', async () => {
        (mockClient.listControllerUsers as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
        registerListControllerUsersTool(mockServer, mockClient);
        await expect(toolHandler({}, { sessionId: 'test' })).rejects.toThrow('fail');
    });
});
