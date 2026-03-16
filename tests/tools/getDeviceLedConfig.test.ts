import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetDeviceLedConfigTool } from '../../src/tools/getDeviceLedConfig.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getDeviceLedConfig', () => {
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
            getDeviceLedConfig: vi.fn(),
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

    describe('registerGetDeviceLedConfigTool', () => {
        it('should register the getDeviceLedConfig tool with correct schema', () => {
            registerGetDeviceLedConfigTool(mockServer, mockClient);

            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceLedConfig', expect.any(Object), expect.any(Function));
        });

        it('should execute successfully with deviceMac', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getDeviceLedConfig as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetDeviceLedConfigTool(mockServer, mockClient);

            const result = await toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(mockClient.getDeviceLedConfig).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', undefined, undefined);
            expect(result).toEqual({
                content: [{ type: 'text', text: JSON.stringify(mockData, null, 2) }],
            });
        });

        it('should pass siteId when provided', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getDeviceLedConfig as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetDeviceLedConfigTool(mockServer, mockClient);

            await toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF', siteId: 'test-site' }, { sessionId: 'test-session' });

            expect(mockClient.getDeviceLedConfig).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', 'test-site', undefined);
        });

        it('should handle empty response', async () => {
            (mockClient.getDeviceLedConfig as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

            registerGetDeviceLedConfigTool(mockServer, mockClient);

            const result = await toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(result).toEqual({ content: [] });
        });

        it('should handle errors', async () => {
            const error = new Error('API error');
            (mockClient.getDeviceLedConfig as ReturnType<typeof vi.fn>).mockRejectedValue(error);

            registerGetDeviceLedConfigTool(mockServer, mockClient);

            await expect(toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' })).rejects.toThrow('API error');

            expect(loggerModule.logger.error).toHaveBeenCalledWith('Tool failed', {
                tool: 'getDeviceLedConfig',
                sessionId: 'test-session',
                error: 'API error',
            });
        });
    });
});
