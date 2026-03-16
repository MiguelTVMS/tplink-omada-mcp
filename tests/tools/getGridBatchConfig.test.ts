import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetGridBatchConfigTool } from '../../src/tools/getGridBatchConfig.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getGridBatchConfig', () => {
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
            getGridBatchConfig: vi.fn(),
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

    describe('registerGetGridBatchConfigTool', () => {
        it('should register the getGridBatchConfig tool with correct schema', () => {
            registerGetGridBatchConfigTool(mockServer, mockClient);

            expect(mockServer.registerTool).toHaveBeenCalledWith('getGridBatchConfig', expect.any(Object), expect.any(Function));
        });

        it('should execute successfully with default pagination', async () => {
            const mockData = { data: [] };
            (mockClient.getGridBatchConfig as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetGridBatchConfigTool(mockServer, mockClient);

            const result = await toolHandler({ page: 1, pageSize: 10 }, { sessionId: 'test-session' });

            expect(mockClient.getGridBatchConfig).toHaveBeenCalledWith(1, 10, undefined);
            expect(result).toEqual({
                content: [{ type: 'text', text: JSON.stringify(mockData, null, 2) }],
            });
        });

        it('should execute with custom pagination', async () => {
            const mockData = { data: [] };
            (mockClient.getGridBatchConfig as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetGridBatchConfigTool(mockServer, mockClient);

            await toolHandler({ page: 2, pageSize: 50 }, { sessionId: 'test-session' });

            expect(mockClient.getGridBatchConfig).toHaveBeenCalledWith(2, 50, undefined);
        });

        it('should handle empty response', async () => {
            (mockClient.getGridBatchConfig as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

            registerGetGridBatchConfigTool(mockServer, mockClient);

            const result = await toolHandler({ page: 1, pageSize: 10 }, { sessionId: 'test-session' });

            expect(result).toEqual({ content: [] });
        });

        it('should handle errors', async () => {
            const error = new Error('API error');
            (mockClient.getGridBatchConfig as ReturnType<typeof vi.fn>).mockRejectedValue(error);

            registerGetGridBatchConfigTool(mockServer, mockClient);

            await expect(toolHandler({ page: 1, pageSize: 10 }, { sessionId: 'test-session' })).rejects.toThrow('API error');

            expect(loggerModule.logger.error).toHaveBeenCalledWith('Tool failed', {
                tool: 'getGridBatchConfig',
                sessionId: 'test-session',
                error: 'API error',
            });
        });
    });
});
