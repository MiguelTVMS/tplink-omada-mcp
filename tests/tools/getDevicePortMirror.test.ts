import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetDevicePortMirrorTool } from '../../src/tools/getDevicePortMirror.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getDevicePortMirror', () => {
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
            getDevicePortMirror: vi.fn(),
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

    describe('registerGetDevicePortMirrorTool', () => {
        it('should register the getDevicePortMirror tool with correct schema', () => {
            registerGetDevicePortMirrorTool(mockServer, mockClient);

            expect(mockServer.registerTool).toHaveBeenCalledWith('getDevicePortMirror', expect.any(Object), expect.any(Function));
        });

        it('should execute successfully with deviceMac', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getDevicePortMirror as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetDevicePortMirrorTool(mockServer, mockClient);

            const result = await toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(mockClient.getDevicePortMirror).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', undefined, undefined);
            expect(result).toEqual({
                content: [{ type: 'text', text: JSON.stringify(mockData, null, 2) }],
            });
        });

        it('should pass siteId when provided', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getDevicePortMirror as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetDevicePortMirrorTool(mockServer, mockClient);

            await toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF', siteId: 'test-site' }, { sessionId: 'test-session' });

            expect(mockClient.getDevicePortMirror).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', 'test-site', undefined);
        });

        it('should handle empty response', async () => {
            (mockClient.getDevicePortMirror as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

            registerGetDevicePortMirrorTool(mockServer, mockClient);

            const result = await toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(result).toEqual({ content: [] });
        });

        it('should handle errors', async () => {
            const error = new Error('API error');
            (mockClient.getDevicePortMirror as ReturnType<typeof vi.fn>).mockRejectedValue(error);

            registerGetDevicePortMirrorTool(mockServer, mockClient);

            await expect(toolHandler({ deviceMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' })).rejects.toThrow('API error');

            expect(loggerModule.logger.error).toHaveBeenCalledWith('Tool failed', {
                tool: 'getDevicePortMirror',
                sessionId: 'test-session',
                error: 'API error',
            });
        });
    });
});
