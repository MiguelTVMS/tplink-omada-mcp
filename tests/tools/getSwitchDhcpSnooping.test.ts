import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetSwitchDhcpSnoopingTool } from '../../src/tools/getSwitchDhcpSnooping.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getSwitchDhcpSnooping', () => {
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
            getSwitchDhcpSnooping: vi.fn(),
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

    describe('registerGetSwitchDhcpSnoopingTool', () => {
        it('should register the getSwitchDhcpSnooping tool with correct schema', () => {
            registerGetSwitchDhcpSnoopingTool(mockServer, mockClient);

            expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchDhcpSnooping', expect.any(Object), expect.any(Function));
        });

        it('should execute successfully with switchMac', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getSwitchDhcpSnooping as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetSwitchDhcpSnoopingTool(mockServer, mockClient);

            const result = await toolHandler({ switchMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(mockClient.getSwitchDhcpSnooping).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', undefined, undefined);
            expect(result).toEqual({
                content: [{ type: 'text', text: JSON.stringify(mockData, null, 2) }],
            });
        });

        it('should pass siteId when provided', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getSwitchDhcpSnooping as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetSwitchDhcpSnoopingTool(mockServer, mockClient);

            await toolHandler({ switchMac: 'AA-BB-CC-DD-EE-FF', siteId: 'test-site' }, { sessionId: 'test-session' });

            expect(mockClient.getSwitchDhcpSnooping).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', 'test-site', undefined);
        });

        it('should handle empty response', async () => {
            (mockClient.getSwitchDhcpSnooping as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

            registerGetSwitchDhcpSnoopingTool(mockServer, mockClient);

            const result = await toolHandler({ switchMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(result).toEqual({ content: [] });
        });

        it('should handle errors', async () => {
            const error = new Error('API error');
            (mockClient.getSwitchDhcpSnooping as ReturnType<typeof vi.fn>).mockRejectedValue(error);

            registerGetSwitchDhcpSnoopingTool(mockServer, mockClient);

            await expect(toolHandler({ switchMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' })).rejects.toThrow('API error');

            expect(loggerModule.logger.error).toHaveBeenCalledWith('Tool failed', {
                tool: 'getSwitchDhcpSnooping',
                sessionId: 'test-session',
                error: 'API error',
            });
        });
    });
});
