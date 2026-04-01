import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetVpnClientsByServerTool } from '../../src/tools/getVpnClientsByServer.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getVpnClientsByServer', () => {
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
            getVpnClientsByServer: vi.fn(),
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

    it('should register the getVpnClientsByServer tool', () => {
        registerGetVpnClientsByServerTool(mockServer, mockClient);
        expect(mockServer.registerTool).toHaveBeenCalledWith('getVpnClientsByServer', expect.any(Object), expect.any(Function));
    });

    it('should call client with vpnId and siteId', async () => {
        const mockResult = [{ clientIp: '10.0.0.1', username: 'alice' }];
        (mockClient.getVpnClientsByServer as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

        registerGetVpnClientsByServerTool(mockServer, mockClient);
        const result = await toolHandler({ vpnId: 'vpn-123', siteId: 'site1' }, { sessionId: 'test' });

        expect(mockClient.getVpnClientsByServer).toHaveBeenCalledWith('vpn-123', 'site1', undefined);
        expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(mockResult, null, 2) }] });
    });

    it('should handle errors', async () => {
        (mockClient.getVpnClientsByServer as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
        registerGetVpnClientsByServerTool(mockServer, mockClient);
        await expect(toolHandler({ vpnId: 'vpn-123' }, { sessionId: 'test' })).rejects.toThrow('fail');
    });
});
