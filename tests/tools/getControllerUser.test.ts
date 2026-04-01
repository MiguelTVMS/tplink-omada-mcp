import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetControllerUserTool } from '../../src/tools/getControllerUser.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getControllerUser', () => {
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
            getControllerUser: vi.fn(),
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

    it('should register the getControllerUser tool', () => {
        registerGetControllerUserTool(mockServer, mockClient);
        expect(mockServer.registerTool).toHaveBeenCalledWith('getControllerUser', expect.any(Object), expect.any(Function));
    });

    it('should call client with userID', async () => {
        const mockResult = { id: 'u1', username: 'admin', role: 'Administrator' };
        (mockClient.getControllerUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

        registerGetControllerUserTool(mockServer, mockClient);
        const result = await toolHandler({ userID: 'u1' }, { sessionId: 'test' });

        expect(mockClient.getControllerUser).toHaveBeenCalledWith('u1', undefined);
        expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(mockResult, null, 2) }] });
    });

    it('should handle errors', async () => {
        (mockClient.getControllerUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
        registerGetControllerUserTool(mockServer, mockClient);
        await expect(toolHandler({ userID: 'u1' }, { sessionId: 'test' })).rejects.toThrow('fail');
    });
});
