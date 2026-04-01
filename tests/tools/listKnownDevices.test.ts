import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerListKnownDevicesTool } from '../../src/tools/listKnownDevices.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/listKnownDevices', () => {
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
            listKnownDevices: vi.fn(),
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

    it('should register the listKnownDevices tool', () => {
        registerListKnownDevicesTool(mockServer, mockClient);
        expect(mockServer.registerTool).toHaveBeenCalledWith('listKnownDevices', expect.any(Object), expect.any(Function));
    });

    it('should return known devices', async () => {
        const mockResult = [{ mac: '00:11:22:33:44:55' }];
        (mockClient.listKnownDevices as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

        registerListKnownDevicesTool(mockServer, mockClient);
        const result = await toolHandler({}, { sessionId: 'test' });

        expect(mockClient.listKnownDevices).toHaveBeenCalledWith(1, 50, undefined);
        expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(mockResult, null, 2) }] });
    });

    it('should handle errors', async () => {
        (mockClient.listKnownDevices as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
        registerListKnownDevicesTool(mockServer, mockClient);
        await expect(toolHandler({}, { sessionId: 'test' })).rejects.toThrow('fail');
    });
});
