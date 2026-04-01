import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetDeviceRememberStateTool } from '../../src/tools/getDeviceRememberState.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getDeviceRememberState', () => {
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
            getDeviceRememberState: vi.fn(),
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

    it('should register the getDeviceRememberState tool', () => {
        registerGetDeviceRememberStateTool(mockServer, mockClient);
        expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceRememberState', expect.any(Object), expect.any(Function));
    });

    it('should call client with deviceMac and siteId', async () => {
        const mockResult = { remember: true };
        (mockClient.getDeviceRememberState as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

        registerGetDeviceRememberStateTool(mockServer, mockClient);
        const result = await toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF', siteId: 'site1' }, { sessionId: 'test' });

        expect(mockClient.getDeviceRememberState).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', 'site1', undefined);
        expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(mockResult, null, 2) }] });
    });

    it('should handle errors', async () => {
        (mockClient.getDeviceRememberState as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
        registerGetDeviceRememberStateTool(mockServer, mockClient);
        await expect(toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test' })).rejects.toThrow('fail');
    });
});
