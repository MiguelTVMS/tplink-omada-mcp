import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetDeviceOnlineUpgradeResultTool } from '../../src/tools/getDeviceOnlineUpgradeResult.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getDeviceOnlineUpgradeResult', () => {
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
            getDeviceOnlineUpgradeResult: vi.fn(),
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

    it('should register the getDeviceOnlineUpgradeResult tool', () => {
        registerGetDeviceOnlineUpgradeResultTool(mockServer, mockClient);
        expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceOnlineUpgradeResult', expect.any(Object), expect.any(Function));
    });

    it('should call client with deviceMac and siteId', async () => {
        const mockResult = { upgradeStatus: 'done' };
        (mockClient.getDeviceOnlineUpgradeResult as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

        registerGetDeviceOnlineUpgradeResultTool(mockServer, mockClient);
        const result = await toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF', siteId: 'site1' }, { sessionId: 'test' });

        expect(mockClient.getDeviceOnlineUpgradeResult).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', 'site1', undefined);
        expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(mockResult, null, 2) }] });
    });

    it('should handle errors', async () => {
        (mockClient.getDeviceOnlineUpgradeResult as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
        registerGetDeviceOnlineUpgradeResultTool(mockServer, mockClient);
        await expect(toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test' })).rejects.toThrow('fail');
    });
});
