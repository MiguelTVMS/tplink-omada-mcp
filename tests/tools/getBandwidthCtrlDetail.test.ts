import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetBandwidthCtrlDetailTool } from '../../src/tools/getBandwidthCtrlDetail.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getBandwidthCtrlDetail', () => {
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
            getBandwidthCtrlDetail: vi.fn(),
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

    describe('registerGetBandwidthCtrlDetailTool', () => {
        it('should register the tool', () => {
            registerGetBandwidthCtrlDetailTool(mockServer, mockClient);
            expect(mockServer.registerTool).toHaveBeenCalledWith('getBandwidthCtrlDetail', expect.any(Object), expect.any(Function));
        });

        it('should execute with pagination', async () => {
            const mockData = [{ id: 'bw-1' }];
            (mockClient.getBandwidthCtrlDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
            registerGetBandwidthCtrlDetailTool(mockServer, mockClient);
            const result = await toolHandler({ page: 1, pageSize: 10 }, { sessionId: 'test' });
            expect(mockClient.getBandwidthCtrlDetail).toHaveBeenCalledWith(1, 10, undefined, undefined);
            expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(mockData, null, 2) }] });
        });

        it('should pass custom page and pageSize', async () => {
            (mockClient.getBandwidthCtrlDetail as ReturnType<typeof vi.fn>).mockResolvedValue([]);
            registerGetBandwidthCtrlDetailTool(mockServer, mockClient);
            await toolHandler({ page: 2, pageSize: 25 }, { sessionId: 'test' });
            expect(mockClient.getBandwidthCtrlDetail).toHaveBeenCalledWith(2, 25, undefined, undefined);
        });

        it('should pass siteId', async () => {
            (mockClient.getBandwidthCtrlDetail as ReturnType<typeof vi.fn>).mockResolvedValue([]);
            registerGetBandwidthCtrlDetailTool(mockServer, mockClient);
            await toolHandler({ page: 1, pageSize: 10, siteId: 'site-1' }, { sessionId: 'test' });
            expect(mockClient.getBandwidthCtrlDetail).toHaveBeenCalledWith(1, 10, 'site-1', undefined);
        });

        it('should handle errors', async () => {
            (mockClient.getBandwidthCtrlDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
            registerGetBandwidthCtrlDetailTool(mockServer, mockClient);
            await expect(toolHandler({}, { sessionId: 'test' })).rejects.toThrow('fail');
        });
    });
});
