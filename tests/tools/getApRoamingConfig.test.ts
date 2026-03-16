import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerGetApRoamingConfigTool } from '../../src/tools/getApRoamingConfig.js';
import * as loggerModule from '../../src/utils/logger.js';

describe('tools/getApRoamingConfig', () => {
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
            getApRoamingConfig: vi.fn(),
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

    describe('registerGetApRoamingConfigTool', () => {
        it('should register the getApRoamingConfig tool with correct schema', () => {
            registerGetApRoamingConfigTool(mockServer, mockClient);

            expect(mockServer.registerTool).toHaveBeenCalledWith('getApRoamingConfig', expect.any(Object), expect.any(Function));
        });

        it('should execute successfully with apMac', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getApRoamingConfig as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetApRoamingConfigTool(mockServer, mockClient);

            const result = await toolHandler({ apMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(mockClient.getApRoamingConfig).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', undefined, undefined);
            expect(result).toEqual({
                content: [{ type: 'text', text: JSON.stringify(mockData, null, 2) }],
            });
        });

        it('should pass siteId when provided', async () => {
            const mockData = { result: 'ok' };
            (mockClient.getApRoamingConfig as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

            registerGetApRoamingConfigTool(mockServer, mockClient);

            await toolHandler({ apMac: 'AA-BB-CC-DD-EE-FF', siteId: 'test-site' }, { sessionId: 'test-session' });

            expect(mockClient.getApRoamingConfig).toHaveBeenCalledWith('AA-BB-CC-DD-EE-FF', 'test-site', undefined);
        });

        it('should handle empty response', async () => {
            (mockClient.getApRoamingConfig as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

            registerGetApRoamingConfigTool(mockServer, mockClient);

            const result = await toolHandler({ apMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' });

            expect(result).toEqual({ content: [] });
        });

        it('should handle errors', async () => {
            const error = new Error('API error');
            (mockClient.getApRoamingConfig as ReturnType<typeof vi.fn>).mockRejectedValue(error);

            registerGetApRoamingConfigTool(mockServer, mockClient);

            await expect(toolHandler({ apMac: 'AA-BB-CC-DD-EE-FF' }, { sessionId: 'test-session' })).rejects.toThrow('API error');

            expect(loggerModule.logger.error).toHaveBeenCalledWith('Tool failed', {
                tool: 'getApRoamingConfig',
                sessionId: 'test-session',
                error: 'API error',
            });
        });
    });
});
