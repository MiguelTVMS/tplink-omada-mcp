import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetDevicePoEConfigTool } from '../../src/tools/getDevicePoEConfig.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getDevicePoEConfig', () => {
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
            getDevicePoEConfig: vi.fn(),
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

    describe('registerGetDevicePoEConfigTool', () => {
        it('should register the getDevicePoEConfig tool with correct schema', () => {
            registerGetDevicePoEConfigTool(mockServer, mockClient);

            expect(mockServer.registerTool).toHaveBeenCalledWith('getDevicePoEConfig', expect.any(Object), expect.any(Function));
        });

        it('should execute successfully with deviceMac', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getDevicePoEConfig as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetDevicePoEConfigTool(mockServer, mockClient);

            const result = await toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(mockClient.getDevicePoEConfig).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', undefined, undefined);
            expect(result).toEqual({
                content: [{ type: 'text', text: JSON.stringify(mockData, null, 2) }],
            });
        });

        it('should pass siteId when provided', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getDevicePoEConfig as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetDevicePoEConfigTool(mockServer, mockClient);

            await toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF', siteId: 'test-site' }, { sessionId: 'test-session' });

            expect(mockClient.getDevicePoEConfig).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', 'test-site', undefined);
        });

        it('should handle empty response', async () => {
            (mockClient.getDevicePoEConfig as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

            registerGetDevicePoEConfigTool(mockServer, mockClient);

            const result = await toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(result).toEqual({ content: [] });
        });

        it('should handle errors', async () => {
            const error = new Error('API error');
            (mockClient.getDevicePoEConfig as ReturnType<typeof vi.fn>).mockRejectedValue(error);

            registerGetDevicePoEConfigTool(mockServer, mockClient);

            await expect(toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' })).rejects.toThrow('API error');

            expect(loggerModule.logger.error).toHaveBeenCalledWith('Tool failed', {
                tool: 'getDevicePoEConfig',
                sessionId: 'test-session',
                error: 'API error',
            });
        });
    });
});
