import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetDeviceHealthSummaryTool } from '../../src/tools/getDeviceHealthSummary.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getDeviceHealthSummary', () => {
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
            getDeviceHealthSummary: vi.fn(),
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

    describe('registerGetDeviceHealthSummaryTool', () => {
        it('should register the getDeviceHealthSummary tool with correct schema', () => {
            registerGetDeviceHealthSummaryTool(mockServer, mockClient);

            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceHealthSummary', expect.any(Object), expect.any(Function));
        });

        it('should execute successfully', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getDeviceHealthSummary as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetDeviceHealthSummaryTool(mockServer, mockClient);

            const result = await toolHandler({}, { sessionId: 'test-session' });

            expect(mockClient.getDeviceHealthSummary).toHaveBeenCalledWith(undefined, undefined);
            expect(result).toEqual({
                content: [{ type: 'text', text: JSON.stringify(mockData, null, 2) }],
            });
        });

        it('should pass siteId when provided', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getDeviceHealthSummary as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetDeviceHealthSummaryTool(mockServer, mockClient);

            await toolHandler({ siteId: 'test-site' }, { sessionId: 'test-session' });

            expect(mockClient.getDeviceHealthSummary).toHaveBeenCalledWith('test-site', undefined);
        });

        it('should handle empty response', async () => {
            (mockClient.getDeviceHealthSummary as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

            registerGetDeviceHealthSummaryTool(mockServer, mockClient);

            const result = await toolHandler({}, { sessionId: 'test-session' });

            expect(result).toEqual({ content: [] });
        });

        it('should handle errors', async () => {
            const error = new Error('API error');
            (mockClient.getDeviceHealthSummary as ReturnType<typeof vi.fn>).mockRejectedValue(error);

            registerGetDeviceHealthSummaryTool(mockServer, mockClient);

            await expect(toolHandler({}, { sessionId: 'test-session' })).rejects.toThrow('API error');

            expect(loggerModule.logger.error).toHaveBeenCalledWith('Tool failed', {
                tool: 'getDeviceHealthSummary',
                sessionId: 'test-session',
                error: 'API error',
            });
        });
    });
});
