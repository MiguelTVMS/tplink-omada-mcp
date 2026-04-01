import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetDeviceAdoptResultTool } from '../../src/tools/getDeviceAdoptResult.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getDeviceAdoptResult', () => {
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
            getDeviceAdoptResult: vi.fn(),
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

    it('should register the getDeviceAdoptResult tool', () => {
        registerGetDeviceAdoptResultTool(mockServer, mockClient);
        expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceAdoptResult', expect.any(Object), expect.any(Function));
    });

    it('should call client with deviceMac and siteId', async () => {
        const mockResult = { status: 'success' };
        (mockClient.getDeviceAdoptResult as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

        registerGetDeviceAdoptResultTool(mockServer, mockClient);
        const result = await toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF', siteId: 'site1' }, { sessionId: 'test' });

        expect(mockClient.getDeviceAdoptResult).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', 'site1', undefined);
        expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(mockResult, null, 2) }] });
    });

    it('should pass customHeaders when provided', async () => {
        (mockClient.getDeviceAdoptResult as ReturnType<typeof vi.fn>).mockResolvedValue({});
        registerGetDeviceAdoptResultTool(mockServer, mockClient);
        await toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF', customHeaders: { 'X-Test': 'val' } }, { sessionId: 'test' });
        expect(mockClient.getDeviceAdoptResult).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', undefined, { 'X-Test': 'val' });
    });

    it('should handle errors', async () => {
        (mockClient.getDeviceAdoptResult as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
        registerGetDeviceAdoptResultTool(mockServer, mockClient);
        await expect(toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test' })).rejects.toThrow('fail');
    });
});
