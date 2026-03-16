import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetApPortMirrorTool } from '../../src/tools/getApPortMirror.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getApPortMirror', () => {
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
            getApPortMirror: vi.fn(),
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

    describe('registerGetApPortMirrorTool', () => {
        it('should register the getApPortMirror tool with correct schema', () => {
            registerGetApPortMirrorTool(mockServer, mockClient);

            expect(mockServer.registerTool).toHaveBeenCalledWith('getApPortMirror', expect.any(Object), expect.any(Function));
        });

        it('should execute successfully with apMac', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getApPortMirror as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetApPortMirrorTool(mockServer, mockClient);

            const result = await toolHandler({ apMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(mockClient.getApPortMirror).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', undefined, undefined);
            expect(result).toEqual({
                content: [{ type: 'text', text: JSON.stringify(mockData, null, 2) }],
            });
        });

        it('should pass siteId when provided', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getApPortMirror as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetApPortMirrorTool(mockServer, mockClient);

            await toolHandler({ apMac: 'AA-BB-CC-DD-EE-FF', siteId: 'test-site' }, { sessionId: 'test-session' });

            expect(mockClient.getApPortMirror).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', 'test-site', undefined);
        });

        it('should handle empty response', async () => {
            (mockClient.getApPortMirror as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

            registerGetApPortMirrorTool(mockServer, mockClient);

            const result = await toolHandler({ apMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(result).toEqual({ content: [] });
        });

        it('should handle errors', async () => {
            const error = new Error('API error');
            (mockClient.getApPortMirror as ReturnType<typeof vi.fn>).mockRejectedValue(error);

            registerGetApPortMirrorTool(mockServer, mockClient);

            await expect(toolHandler({ apMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' })).rejects.toThrow('API error');

            expect(loggerModule.logger.error).toHaveBeenCalledWith('Tool failed', {
                tool: 'getApPortMirror',
                sessionId: 'test-session',
                error: 'API error',
            });
        });
    });
});
