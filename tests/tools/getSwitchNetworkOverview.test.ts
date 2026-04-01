import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetSwitchNetworkOverviewTool } from '../../src/tools/getSwitchNetworkOverview.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getSwitchNetworkOverview', () => {
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
            getSwitchNetworkOverview: vi.fn(),
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

    it('should register the getSwitchNetworkOverview tool', () => {
        registerGetSwitchNetworkOverviewTool(mockServer, mockClient);
        expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchNetworkOverview', expect.any(Object), expect.any(Function));
    });

    it('should call client with switchMac and siteId', async () => {
        const mockResult = { networkCount: 5 };
        (mockClient.getSwitchNetworkOverview as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

        registerGetSwitchNetworkOverviewTool(mockServer, mockClient);
        const result = await toolHandler({ switchMac: 'AA-BB-CC-DD-EE-FF', siteId: 'site1' }, { sessionId: 'test' });

        expect(mockClient.getSwitchNetworkOverview).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', 'site1', undefined);
        expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(mockResult, null, 2) }] });
    });

    it('should handle errors', async () => {
        (mockClient.getSwitchNetworkOverview as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
        registerGetSwitchNetworkOverviewTool(mockServer, mockClient);
        await expect(toolHandler({ switchMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test' })).rejects.toThrow('fail');
    });
});
