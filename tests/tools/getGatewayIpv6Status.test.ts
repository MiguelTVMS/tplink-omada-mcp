import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetGatewayIpv6StatusTool } from '../../src/tools/getGatewayIpv6Status.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getGatewayIpv6Status', () => {
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
            getGatewayIpv6Status: vi.fn(),
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

    describe('registerGetGatewayIpv6StatusTool', () => {
        it('should register the getGatewayIpv6Status tool with correct schema', () => {
            registerGetGatewayIpv6StatusTool(mockServer, mockClient);

            expect(mockServer.registerTool).toHaveBeenCalledWith('getGatewayIpv6Status', expect.any(Object), expect.any(Function));
        });

        it('should execute successfully with gatewayMac', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getGatewayIpv6Status as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetGatewayIpv6StatusTool(mockServer, mockClient);

            const result = await toolHandler({ gatewayMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(mockClient.getGatewayIpv6Status).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', undefined, undefined);
            expect(result).toEqual({
                content: [{ type: 'text', text: JSON.stringify(mockData, null, 2) }],
            });
        });

        it('should pass siteId when provided', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getGatewayIpv6Status as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetGatewayIpv6StatusTool(mockServer, mockClient);

            await toolHandler({ gatewayMac: 'AA-BB-CC-DD-EE-FF', siteId: 'test-site' }, { sessionId: 'test-session' });

            expect(mockClient.getGatewayIpv6Status).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', 'test-site', undefined);
        });

        it('should handle empty response', async () => {
            (mockClient.getGatewayIpv6Status as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

            registerGetGatewayIpv6StatusTool(mockServer, mockClient);

            const result = await toolHandler({ gatewayMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(result).toEqual({ content: [] });
        });

        it('should handle errors', async () => {
            const error = new Error('API error');
            (mockClient.getGatewayIpv6Status as ReturnType<typeof vi.fn>).mockRejectedValue(error);

            registerGetGatewayIpv6StatusTool(mockServer, mockClient);

            await expect(toolHandler({ gatewayMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' })).rejects.toThrow('API error');

            expect(loggerModule.logger.error).toHaveBeenCalledWith('Tool failed', {
                tool: 'getGatewayIpv6Status',
                sessionId: 'test-session',
                error: 'API error',
            });
        });
    });
});
