import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetGatewayMacTableTool } from '../../src/tools/getGatewayMacTable.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getGatewayMacTable', () => {
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
            getGatewayMacTable: vi.fn(),
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

    describe('registerGetGatewayMacTableTool', () => {
        it('should register the getGatewayMacTable tool with correct schema', () => {
            registerGetGatewayMacTableTool(mockServer, mockClient);

            expect(mockServer.registerTool).toHaveBeenCalledWith('getGatewayMacTable', expect.any(Object), expect.any(Function));
        });

        it('should execute successfully with gatewayMac', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getGatewayMacTable as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetGatewayMacTableTool(mockServer, mockClient);

            const result = await toolHandler({ gatewayMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(mockClient.getGatewayMacTable).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', undefined, undefined);
            expect(result).toEqual({
                content: [{ type: 'text', text: JSON.stringify(mockData, null, 2) }],
            });
        });

        it('should pass siteId when provided', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getGatewayMacTable as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetGatewayMacTableTool(mockServer, mockClient);

            await toolHandler({ gatewayMac: 'AA-BB-CC-DD-EE-FF', siteId: 'test-site' }, { sessionId: 'test-session' });

            expect(mockClient.getGatewayMacTable).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', 'test-site', undefined);
        });

        it('should handle empty response', async () => {
            (mockClient.getGatewayMacTable as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

            registerGetGatewayMacTableTool(mockServer, mockClient);

            const result = await toolHandler({ gatewayMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(result).toEqual({ content: [] });
        });

        it('should handle errors', async () => {
            const error = new Error('API error');
            (mockClient.getGatewayMacTable as ReturnType<typeof vi.fn>).mockRejectedValue(error);

            registerGetGatewayMacTableTool(mockServer, mockClient);

            await expect(toolHandler({ gatewayMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' })).rejects.toThrow('API error');

            expect(loggerModule.logger.error).toHaveBeenCalledWith('Tool failed', {
                tool: 'getGatewayMacTable',
                sessionId: 'test-session',
                error: 'API error',
            });
        });
    });
});
