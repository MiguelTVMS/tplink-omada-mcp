import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerListUnknownDevicesTool } from '../../src/tools/listUnknownDevices.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/listUnknownDevices', () => {
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
            listUnknownDevices: vi.fn(),
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

    it('should register the listUnknownDevices tool', () => {
        registerListUnknownDevicesTool(mockServer, mockClient);
        expect(mockServer.registerTool).toHaveBeenCalledWith('listUnknownDevices', expect.any(Object), expect.any(Function));
    });

    it('should return unknown devices', async () => {
        const mockResult = [{ mac: 'AA:BB:CC:DD:EE:FF' }];
        (mockClient.listUnknownDevices as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

        registerListUnknownDevicesTool(mockServer, mockClient);
        const result = await toolHandler({}, { sessionId: 'test' });

        expect(mockClient.listUnknownDevices).toHaveBeenCalledWith(undefined);
        expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(mockResult, null, 2) }] });
    });

    it('should handle errors', async () => {
        (mockClient.listUnknownDevices as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
        registerListUnknownDevicesTool(mockServer, mockClient);
        await expect(toolHandler({}, { sessionId: 'test' })).rejects.toThrow('fail');
    });
});
