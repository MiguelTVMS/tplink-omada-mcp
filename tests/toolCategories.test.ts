import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ALL_CATEGORIES, CATEGORY_GROUP_ALIASES, DEFAULT_TOOL_CATEGORIES, parseToolCategories } from '../src/config.js';
import type { OmadaClient } from '../src/omadaClient/index.js';
import { registerAllTools } from '../src/tools/index.js';
import * as loggerModule from '../src/utils/logger.js';

describe('parseToolCategories', () => {
    beforeEach(() => {
        vi.spyOn(loggerModule.logger, 'warn').mockImplementation(() => {
            // Mock implementation
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // -----------------------------------------------------------------------
    // Default value
    // -----------------------------------------------------------------------

    it('parses the default OMADA_TOOL_CATEGORIES without error', () => {
        const result = parseToolCategories(DEFAULT_TOOL_CATEGORIES);
        expect(result.size).toBeGreaterThan(0);
    });

    it('default includes dashboard, client-insights, insights, clients with only read', () => {
        const result = parseToolCategories(DEFAULT_TOOL_CATEGORIES);
        expect(result.get('dashboard')).toEqual(new Set(['read']));
        expect(result.get('client-insights')).toEqual(new Set(['read']));
        expect(result.get('insights')).toEqual(new Set(['read']));
        expect(result.get('clients')).toEqual(new Set(['read']));
    });

    it('default expands devices-all:r to all four device categories with read', () => {
        const result = parseToolCategories(DEFAULT_TOOL_CATEGORIES);
        for (const cat of CATEGORY_GROUP_ALIASES['devices-all']) {
            expect(result.get(cat)).toEqual(new Set(['read']));
        }
    });

    // -----------------------------------------------------------------------
    // Suffix parsing
    // -----------------------------------------------------------------------

    it(':r suffix produces read-only permission', () => {
        const result = parseToolCategories('clients:r');
        expect(result.get('clients')).toEqual(new Set(['read']));
    });

    it(':w suffix produces write-only permission', () => {
        const result = parseToolCategories('clients:w');
        expect(result.get('clients')).toEqual(new Set(['write']));
    });

    it(':rw suffix produces read and write permissions', () => {
        const result = parseToolCategories('clients:rw');
        expect(result.get('clients')).toEqual(new Set(['read', 'write']));
    });

    it('no suffix defaults to read+write', () => {
        const result = parseToolCategories('clients');
        expect(result.get('clients')).toEqual(new Set(['read', 'write']));
    });

    // -----------------------------------------------------------------------
    // Multiple categories
    // -----------------------------------------------------------------------

    it('parses multiple comma-separated categories', () => {
        const result = parseToolCategories('dashboard:r,clients:w,vpn:rw');
        expect(result.get('dashboard')).toEqual(new Set(['read']));
        expect(result.get('clients')).toEqual(new Set(['write']));
        expect(result.get('vpn')).toEqual(new Set(['read', 'write']));
    });

    it('handles extra whitespace around tokens', () => {
        const result = parseToolCategories(' dashboard:r , clients:r ');
        expect(result.get('dashboard')).toEqual(new Set(['read']));
        expect(result.get('clients')).toEqual(new Set(['read']));
    });

    // -----------------------------------------------------------------------
    // Permission merging (same category listed twice with different perms)
    // -----------------------------------------------------------------------

    it('merges permissions when the same category appears twice', () => {
        const result = parseToolCategories('clients:r,clients:w');
        expect(result.get('clients')).toEqual(new Set(['read', 'write']));
    });

    // -----------------------------------------------------------------------
    // Group alias: all
    // -----------------------------------------------------------------------

    it('all alias expands to every category', () => {
        const result = parseToolCategories('all:r');
        for (const cat of ALL_CATEGORIES) {
            expect(result.has(cat)).toBe(true);
        }
        expect(result.size).toBe(ALL_CATEGORIES.length);
    });

    it('all:rw gives read+write to every category', () => {
        const result = parseToolCategories('all:rw');
        for (const cat of ALL_CATEGORIES) {
            expect(result.get(cat)).toEqual(new Set(['read', 'write']));
        }
    });

    it('all (no suffix) gives read+write to every category', () => {
        const result = parseToolCategories('all');
        for (const cat of ALL_CATEGORIES) {
            expect(result.get(cat)).toEqual(new Set(['read', 'write']));
        }
    });

    // -----------------------------------------------------------------------
    // Group alias expansions
    // -----------------------------------------------------------------------

    it('devices-all expands to the four device categories', () => {
        const result = parseToolCategories('devices-all:r');
        const expected = CATEGORY_GROUP_ALIASES['devices-all'];
        expect(result.size).toBe(expected.length);
        for (const cat of expected) {
            expect(result.get(cat)).toEqual(new Set(['read']));
        }
    });

    it('wireless-all expands correctly', () => {
        const result = parseToolCategories('wireless-all:r');
        const expected = CATEGORY_GROUP_ALIASES['wireless-all'];
        for (const cat of expected) {
            expect(result.get(cat)).toEqual(new Set(['read']));
        }
    });

    it('network-all expands correctly', () => {
        const result = parseToolCategories('network-all:r');
        const expected = CATEGORY_GROUP_ALIASES['network-all'];
        for (const cat of expected) {
            expect(result.get(cat)).toEqual(new Set(['read']));
        }
    });

    it('firewall-all expands correctly', () => {
        const result = parseToolCategories('firewall-all:r');
        const expected = CATEGORY_GROUP_ALIASES['firewall-all'];
        for (const cat of expected) {
            expect(result.get(cat)).toEqual(new Set(['read']));
        }
    });

    it('security-all expands correctly', () => {
        const result = parseToolCategories('security-all:r');
        const expected = CATEGORY_GROUP_ALIASES['security-all'];
        for (const cat of expected) {
            expect(result.get(cat)).toEqual(new Set(['read']));
        }
    });

    it('hotspot-all expands correctly', () => {
        const result = parseToolCategories('hotspot-all:r');
        const expected = CATEGORY_GROUP_ALIASES['hotspot-all'];
        for (const cat of expected) {
            expect(result.get(cat)).toEqual(new Set(['read']));
        }
    });

    it('account-all expands correctly', () => {
        const result = parseToolCategories('account-all:r');
        const expected = CATEGORY_GROUP_ALIASES['account-all'];
        for (const cat of expected) {
            expect(result.get(cat)).toEqual(new Set(['read']));
        }
    });

    // -----------------------------------------------------------------------
    // Suffix inheritance through aliases
    // -----------------------------------------------------------------------

    it('alias suffix :r propagates read-only to all expanded categories', () => {
        const result = parseToolCategories('devices-all:r');
        for (const cat of CATEGORY_GROUP_ALIASES['devices-all']) {
            const perms = result.get(cat);
            expect(perms?.has('read')).toBe(true);
            expect(perms?.has('write')).toBe(false);
        }
    });

    it('alias suffix :w propagates write-only to all expanded categories', () => {
        const result = parseToolCategories('wireless-all:w');
        for (const cat of CATEGORY_GROUP_ALIASES['wireless-all']) {
            const perms = result.get(cat);
            expect(perms?.has('write')).toBe(true);
            expect(perms?.has('read')).toBe(false);
        }
    });

    it('alias with no suffix propagates read+write to all expanded categories', () => {
        const result = parseToolCategories('network-all');
        for (const cat of CATEGORY_GROUP_ALIASES['network-all']) {
            expect(result.get(cat)).toEqual(new Set(['read', 'write']));
        }
    });

    // -----------------------------------------------------------------------
    // Invalid category names
    // -----------------------------------------------------------------------

    it('warns and skips unknown category names', () => {
        const result = parseToolCategories('totally-fake-cat:r');
        expect(loggerModule.logger.warn).toHaveBeenCalledWith(expect.stringContaining('unknown category "totally-fake-cat"'));
        expect(result.size).toBe(0);
    });

    it('skips invalid categories but still parses valid ones', () => {
        const result = parseToolCategories('dashboard:r,invalid-cat:r,clients:r');
        expect(result.get('dashboard')).toEqual(new Set(['read']));
        expect(result.get('clients')).toEqual(new Set(['read']));
        expect(result.has('invalid-cat' as never)).toBe(false);
        expect(loggerModule.logger.warn).toHaveBeenCalledWith(expect.stringContaining('unknown category "invalid-cat"'));
    });

    it('returns empty map for empty string', () => {
        const result = parseToolCategories('');
        expect(result.size).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// Category filtering in registerAllTools
// ---------------------------------------------------------------------------

describe('registerAllTools category filtering', () => {
    let mockServer: McpServer;
    let mockClient: OmadaClient;

    beforeEach(() => {
        mockServer = {
            registerTool: vi.fn(),
        } as unknown as McpServer;
        mockClient = {} as OmadaClient;
        vi.spyOn(loggerModule.logger, 'info').mockImplementation(() => {
            // Mock implementation
        });
        vi.spyOn(loggerModule.logger, 'warn').mockImplementation(() => {
            // Mock implementation
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('registers only tools matching active categories and permissions', () => {
        const activeCategories = parseToolCategories('dashboard:r');
        registerAllTools(mockServer, mockClient, activeCategories);

        expect((mockServer.registerTool as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);
        // dashboard read tools are a subset of all 197 tools
        expect((mockServer.registerTool as ReturnType<typeof vi.fn>).mock.calls.length).toBeLessThan(197);
    });

    it('registers all 197 tools when no activeCategories provided', () => {
        registerAllTools(mockServer, mockClient);
        expect(mockServer.registerTool).toHaveBeenCalledTimes(197);
    });

    it('registers zero tools when active categories map is empty', () => {
        registerAllTools(mockServer, mockClient, new Map());
        expect(mockServer.registerTool).not.toHaveBeenCalled();
    });

    it('registers all tools when all:rw is active', () => {
        const activeCategories = parseToolCategories('all:rw');
        registerAllTools(mockServer, mockClient, activeCategories);
        expect(mockServer.registerTool).toHaveBeenCalledTimes(197);
    });

    it('write-only filter registers only write tools for clients category', () => {
        // clients:w should only register write tools:
        // setClientRateLimit, setClientRateLimitProfile, disableClientRateLimit
        const activeCategories = parseToolCategories('clients:w');
        registerAllTools(mockServer, mockClient, activeCategories);
        expect((mockServer.registerTool as ReturnType<typeof vi.fn>).mock.calls.length).toBe(3);
    });

    it('logs active categories and tool count on startup', () => {
        const activeCategories = parseToolCategories('dashboard:r');
        registerAllTools(mockServer, mockClient, activeCategories);
        expect(loggerModule.logger.info).toHaveBeenCalledWith('Tool categories loaded', expect.objectContaining({ toolCount: expect.any(Number) }));
    });
});
