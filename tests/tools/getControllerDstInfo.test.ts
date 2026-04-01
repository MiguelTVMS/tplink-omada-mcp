import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetControllerDstInfoTool } from '../../src/tools/getControllerDstInfo.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getControllerDstInfo', () => {
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
            getControllerDstInfo: vi.fn(),
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

    it('should register the getControllerDstInfo tool', () => {
        registerGetControllerDstInfoTool(mockServer, mockClient);
        expect(mockServer.registerTool).toHaveBeenCalledWith('getControllerDstInfo', expect.any(Object), expect.any(Function));
    });

    it('should return DST info', async () => {
        const mockResult = { timezone: 'UTC', dst: false };
        (mockClient.getControllerDstInfo as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

        registerGetControllerDstInfoTool(mockServer, mockClient);
        const result = await toolHandler({}, { sessionId: 'test' });

        expect(mockClient.getControllerDstInfo).toHaveBeenCalledWith(undefined);
        expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(mockResult, null, 2) }] });
    });

    it('should handle errors', async () => {
        (mockClient.getControllerDstInfo as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
        registerGetControllerDstInfoTool(mockServer, mockClient);
        await expect(toolHandler({}, { sessionId: 'test' })).rejects.toThrow('fail');
    });
});
