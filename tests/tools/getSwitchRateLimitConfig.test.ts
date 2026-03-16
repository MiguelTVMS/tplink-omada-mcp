import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetSwitchRateLimitConfigTool } from '../../src/tools/getSwitchRateLimitConfig.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getSwitchRateLimitConfig', () => {
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
            getSwitchRateLimitConfig: vi.fn(),
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

    describe('registerGetSwitchRateLimitConfigTool', () => {
        it('should register the getSwitchRateLimitConfig tool with correct schema', () => {
            registerGetSwitchRateLimitConfigTool(mockServer, mockClient);

            expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchRateLimitConfig', expect.any(Object), expect.any(Function));
        });

        it('should execute successfully with switchMac', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getSwitchRateLimitConfig as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetSwitchRateLimitConfigTool(mockServer, mockClient);

            const result = await toolHandler({ switchMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(mockClient.getSwitchRateLimitConfig).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', undefined, undefined);
            expect(result).toEqual({
                content: [{ type: 'text', text: JSON.stringify(mockData, null, 2) }],
            });
        });

        it('should pass siteId when provided', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getSwitchRateLimitConfig as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetSwitchRateLimitConfigTool(mockServer, mockClient);

            await toolHandler({ switchMac: 'AA-BB-CC-DD-EE-FF', siteId: 'test-site' }, { sessionId: 'test-session' });

            expect(mockClient.getSwitchRateLimitConfig).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', 'test-site', undefined);
        });

        it('should handle empty response', async () => {
            (mockClient.getSwitchRateLimitConfig as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

            registerGetSwitchRateLimitConfigTool(mockServer, mockClient);

            const result = await toolHandler({ switchMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(result).toEqual({ content: [] });
        });

        it('should handle errors', async () => {
            const error = new Error('API error');
            (mockClient.getSwitchRateLimitConfig as ReturnType<typeof vi.fn>).mockRejectedValue(error);

            registerGetSwitchRateLimitConfigTool(mockServer, mockClient);

            await expect(toolHandler({ switchMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' })).rejects.toThrow('API error');

            expect(loggerModule.logger.error).toHaveBeenCalledWith('Tool failed', {
                tool: 'getSwitchRateLimitConfig',
                sessionId: 'test-session',
                error: 'API error',
            });
        });
    });
});
