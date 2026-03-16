import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetGatewayPortConfigTool } from '../../src/tools/getGatewayPortConfig.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getGatewayPortConfig', () => {
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
            getGatewayPortConfig: vi.fn(),
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

    describe('registerGetGatewayPortConfigTool', () => {
        it('should register the getGatewayPortConfig tool with correct schema', () => {
            registerGetGatewayPortConfigTool(mockServer, mockClient);

            expect(mockServer.registerTool).toHaveBeenCalledWith('getGatewayPortConfig', expect.any(Object), expect.any(Function));
        });

        it('should execute successfully with gatewayMac', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getGatewayPortConfig as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetGatewayPortConfigTool(mockServer, mockClient);

            const result = await toolHandler({ gatewayMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(mockClient.getGatewayPortConfig).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', undefined, undefined);
            expect(result).toEqual({
                content: [{ type: 'text', text: JSON.stringify(mockData, null, 2) }],
            });
        });

        it('should pass siteId when provided', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getGatewayPortConfig as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetGatewayPortConfigTool(mockServer, mockClient);

            await toolHandler({ gatewayMac: 'AA-BB-CC-DD-EE-FF', siteId: 'test-site' }, { sessionId: 'test-session' });

            expect(mockClient.getGatewayPortConfig).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', 'test-site', undefined);
        });

        it('should handle empty response', async () => {
            (mockClient.getGatewayPortConfig as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

            registerGetGatewayPortConfigTool(mockServer, mockClient);

            const result = await toolHandler({ gatewayMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(result).toEqual({ content: [] });
        });

        it('should handle errors', async () => {
            const error = new Error('API error');
            (mockClient.getGatewayPortConfig as ReturnType<typeof vi.fn>).mockRejectedValue(error);

            registerGetGatewayPortConfigTool(mockServer, mockClient);

            await expect(toolHandler({ gatewayMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' })).rejects.toThrow('API error');

            expect(loggerModule.logger.error).toHaveBeenCalledWith('Tool failed', {
                tool: 'getGatewayPortConfig',
                sessionId: 'test-session',
                error: 'API error',
            });
        });
    });
});
