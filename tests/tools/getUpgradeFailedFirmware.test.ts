import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetUpgradeFailedFirmwareTool } from '../../src/tools/getUpgradeFailedFirmware.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getUpgradeFailedFirmware', () => {
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
            getUpgradeFailedFirmware: vi.fn(),
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

    it('should register the getUpgradeFailedFirmware tool', () => {
        registerGetUpgradeFailedFirmwareTool(mockServer, mockClient);
        expect(mockServer.registerTool).toHaveBeenCalledWith('getUpgradeFailedFirmware', expect.any(Object), expect.any(Function));
    });

    it('should call client with upgradeLogId', async () => {
        const mockResult = { firmwareVersion: '1.2.3', model: 'EAP670' };
        (mockClient.getUpgradeFailedFirmware as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

        registerGetUpgradeFailedFirmwareTool(mockServer, mockClient);
        const result = await toolHandler({ upgradeLogId: 'log-123' }, { sessionId: 'test' });

        expect(mockClient.getUpgradeFailedFirmware).toHaveBeenCalledWith('log-123', undefined);
        expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(mockResult, null, 2) }] });
    });

    it('should handle errors', async () => {
        (mockClient.getUpgradeFailedFirmware as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
        registerGetUpgradeFailedFirmwareTool(mockServer, mockClient);
        await expect(toolHandler({ upgradeLogId: 'log-123' }, { sessionId: 'test' })).rejects.toThrow('fail');
    });
});
