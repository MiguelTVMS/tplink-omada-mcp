import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetDevicesInfoTool } from '../../src/tools/getDevicesInfo.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getDevicesInfo', () => {
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
            getDevicesInfo: vi.fn(),
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

    it('should register the getDevicesInfo tool', () => {
        registerGetDevicesInfoTool(mockServer, mockClient);
        expect(mockServer.registerTool).toHaveBeenCalledWith('getDevicesInfo', expect.any(Object), expect.any(Function));
    });

    it('should return device info with pagination', async () => {
        const mockResult = { data: [] };
        (mockClient.getDevicesInfo as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

        registerGetDevicesInfoTool(mockServer, mockClient);
        const result = await toolHandler({ page: 1, pageSize: 100 }, { sessionId: 'test' });

        expect(mockClient.getDevicesInfo).toHaveBeenCalledWith(1, 100, undefined);
        expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(mockResult, null, 2) }] });
    });

    it('should pass custom page and pageSize', async () => {
        const mockResult = { data: [] };
        (mockClient.getDevicesInfo as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

        registerGetDevicesInfoTool(mockServer, mockClient);
        const result = await toolHandler({ page: 2, pageSize: 50 }, { sessionId: 'test' });

        expect(mockClient.getDevicesInfo).toHaveBeenCalledWith(2, 50, undefined);
        expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(mockResult, null, 2) }] });
    });

    it('should handle errors', async () => {
        const error = new Error('API error');
        (mockClient.getDevicesInfo as ReturnType<typeof vi.fn>).mockRejectedValue(error);

        registerGetDevicesInfoTool(mockServer, mockClient);
        await expect(toolHandler({ page: 1, pageSize: 100 }, { sessionId: 'test' })).rejects.toThrow('API error');
    });
});
