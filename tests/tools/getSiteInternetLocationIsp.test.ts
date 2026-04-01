import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetSiteInternetLocationIspTool } from '../../src/tools/getSiteInternetLocationIsp.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getSiteInternetLocationIsp', () => {
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
            getSiteInternetLocationIsp: vi.fn(),
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

    it('should register the getSiteInternetLocationIsp tool', () => {
        registerGetSiteInternetLocationIspTool(mockServer, mockClient);
        expect(mockServer.registerTool).toHaveBeenCalledWith('getSiteInternetLocationIsp', expect.any(Object), expect.any(Function));
    });

    it('should call client with siteId', async () => {
        const mockResult = { isp: 'Acme ISP', country: 'US' };
        (mockClient.getSiteInternetLocationIsp as ReturnType<typeof vi.fn>).mockResolvedValue(mockResult);

        registerGetSiteInternetLocationIspTool(mockServer, mockClient);
        const result = await toolHandler({ siteId: 'site1' }, { sessionId: 'test' });

        expect(mockClient.getSiteInternetLocationIsp).toHaveBeenCalledWith('site1', undefined);
        expect(result).toEqual({ content: [{ type: 'text', text: JSON.stringify(mockResult, null, 2) }] });
    });

    it('should handle errors', async () => {
        (mockClient.getSiteInternetLocationIsp as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('fail'));
        registerGetSiteInternetLocationIspTool(mockServer, mockClient);
        await expect(toolHandler({}, { sessionId: 'test' })).rejects.toThrow('fail');
    });
});
