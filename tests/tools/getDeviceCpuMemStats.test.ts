import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetDeviceCpuMemStatsTool } from '../../src/tools/getDeviceCpuMemStats.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getDeviceCpuMemStats', () => {
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
            getDeviceCpuMemStats: vi.fn(),
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

    describe('registerGetDeviceCpuMemStatsTool', () => {
        it('should register the getDeviceCpuMemStats tool with correct schema', () => {
            registerGetDeviceCpuMemStatsTool(mockServer, mockClient);

            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceCpuMemStats', expect.any(Object), expect.any(Function));
        });

        it('should execute successfully with deviceMac', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getDeviceCpuMemStats as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetDeviceCpuMemStatsTool(mockServer, mockClient);

            const result = await toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(mockClient.getDeviceCpuMemStats).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', undefined, undefined);
            expect(result).toEqual({
                content: [{ type: 'text', text: JSON.stringify(mockData, null, 2) }],
            });
        });

        it('should pass siteId when provided', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getDeviceCpuMemStats as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetDeviceCpuMemStatsTool(mockServer, mockClient);

            await toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF', siteId: 'test-site' }, { sessionId: 'test-session' });

            expect(mockClient.getDeviceCpuMemStats).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', 'test-site', undefined);
        });

        it('should handle empty response', async () => {
            (mockClient.getDeviceCpuMemStats as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

            registerGetDeviceCpuMemStatsTool(mockServer, mockClient);

            const result = await toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(result).toEqual({ content: [] });
        });

        it('should handle errors', async () => {
            const error = new Error('API error');
            (mockClient.getDeviceCpuMemStats as ReturnType<typeof vi.fn>).mockRejectedValue(error);

            registerGetDeviceCpuMemStatsTool(mockServer, mockClient);

            await expect(toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' })).rejects.toThrow('API error');

            expect(loggerModule.logger.error).toHaveBeenCalledWith('Tool failed', {
                tool: 'getDeviceCpuMemStats',
                sessionId: 'test-session',
                error: 'API error',
            });
        });
    });
});
