import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetGatewayWanPortDetailTool } from '../../src/tools/getGatewayWanPortDetail.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getGatewayWanPortDetail', () => {
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
            getGatewayWanPortDetail: vi.fn(),
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

    describe('registerGetGatewayWanPortDetailTool', () => {
        it('should register the getGatewayWanPortDetail tool with correct schema', () => {
            registerGetGatewayWanPortDetailTool(mockServer, mockClient);

            expect(mockServer.registerTool).toHaveBeenCalledWith('getGatewayWanPortDetail', expect.any(Object), expect.any(Function));
        });

        it('should execute successfully with gatewayMac', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getGatewayWanPortDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetGatewayWanPortDetailTool(mockServer, mockClient);

            const result = await toolHandler({ gatewayMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(mockClient.getGatewayWanPortDetail).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', undefined, undefined);
            expect(result).toEqual({
                content: [{ type: 'text', text: JSON.stringify(mockData, null, 2) }],
            });
        });

        it('should pass siteId when provided', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getGatewayWanPortDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetGatewayWanPortDetailTool(mockServer, mockClient);

            await toolHandler({ gatewayMac: 'AA-BB-CC-DD-EE-FF', siteId: 'test-site' }, { sessionId: 'test-session' });

            expect(mockClient.getGatewayWanPortDetail).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', 'test-site', undefined);
        });

        it('should handle empty response', async () => {
            (mockClient.getGatewayWanPortDetail as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

            registerGetGatewayWanPortDetailTool(mockServer, mockClient);

            const result = await toolHandler({ gatewayMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(result).toEqual({ content: [] });
        });

        it('should handle errors', async () => {
            const error = new Error('API error');
            (mockClient.getGatewayWanPortDetail as ReturnType<typeof vi.fn>).mockRejectedValue(error);

            registerGetGatewayWanPortDetailTool(mockServer, mockClient);

            await expect(toolHandler({ gatewayMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' })).rejects.toThrow('API error');

            expect(loggerModule.logger.error).toHaveBeenCalledWith('Tool failed', {
                tool: 'getGatewayWanPortDetail',
                sessionId: 'test-session',
                error: 'API error',
            });
        });
    });
});
