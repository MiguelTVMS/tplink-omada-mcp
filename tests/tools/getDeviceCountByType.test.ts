import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetDeviceCountByTypeTool } from '../../src/tools/getDeviceCountByType.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getDeviceCountByType', () => {
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
            getDeviceCountByType: vi.fn(),
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

    describe('registerGetDeviceCountByTypeTool', () => {
        it('should register the getDeviceCountByType tool with correct schema', () => {
            registerGetDeviceCountByTypeTool(mockServer, mockClient);

            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceCountByType', expect.any(Object), expect.any(Function));
        });

        it('should execute successfully', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getDeviceCountByType as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetDeviceCountByTypeTool(mockServer, mockClient);

            const result = await toolHandler({}, { sessionId: 'test-session' });

            expect(mockClient.getDeviceCountByType).toHaveBeenCalledWith(undefined, undefined);
            expect(result).toEqual({
                content: [{ type: 'text', text: JSON.stringify(mockData, null, 2) }],
            });
        });

        it('should pass siteId when provided', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getDeviceCountByType as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetDeviceCountByTypeTool(mockServer, mockClient);

            await toolHandler({ siteId: 'test-site' }, { sessionId: 'test-session' });

            expect(mockClient.getDeviceCountByType).toHaveBeenCalledWith('test-site', undefined);
        });

        it('should handle empty response', async () => {
            (mockClient.getDeviceCountByType as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

            registerGetDeviceCountByTypeTool(mockServer, mockClient);

            const result = await toolHandler({}, { sessionId: 'test-session' });

            expect(result).toEqual({ content: [] });
        });

        it('should handle errors', async () => {
            const error = new Error('API error');
            (mockClient.getDeviceCountByType as ReturnType<typeof vi.fn>).mockRejectedValue(error);

            registerGetDeviceCountByTypeTool(mockServer, mockClient);

            await expect(toolHandler({}, { sessionId: 'test-session' })).rejects.toThrow('API error');

            expect(loggerModule.logger.error).toHaveBeenCalledWith('Tool failed', {
                tool: 'getDeviceCountByType',
                sessionId: 'test-session',
                error: 'API error',
            });
        });
    });
});
