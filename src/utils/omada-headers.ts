import type { IncomingHttpHeaders } from 'node:http';
import type { EnvironmentConfig, OmadaConnectionConfig } from '../config.js';

/**
 * Extract the three Omada authentication credential fields from request headers.
 * Only x-omada-client-id, x-omada-client-secret, and x-omada-omadac-id are supported.
 * All other Omada configuration must come from environment variables.
 */
export function extractAuthFromHeaders(headers: IncomingHttpHeaders): {
    authMode?: 'oauth' | 'web';
    clientId?: string;
    clientSecret?: string;
    webUsername?: string;
    webPassword?: string;
    omadacId?: string;
} {
    const result: {
        authMode?: 'oauth' | 'web';
        clientId?: string;
        clientSecret?: string;
        webUsername?: string;
        webPassword?: string;
        omadacId?: string;
    } = {};

    const authMode = headers['x-omada-auth-mode'];
    if (authMode === 'oauth' || authMode === 'web') {
        result.authMode = authMode;
    }

    const clientId = headers['x-omada-client-id'];
    if (typeof clientId === 'string' && clientId.length > 0) {
        result.clientId = clientId;
    }

    const clientSecret = headers['x-omada-client-secret'];
    if (typeof clientSecret === 'string' && clientSecret.length > 0) {
        result.clientSecret = clientSecret;
    }

    const webUsername = headers['x-omada-web-username'];
    if (typeof webUsername === 'string' && webUsername.length > 0) {
        result.webUsername = webUsername;
    }

    const webPassword = headers['x-omada-web-password'];
    if (typeof webPassword === 'string' && webPassword.length > 0) {
        result.webPassword = webPassword;
    }

    const omadacId = headers['x-omada-omadac-id'];
    if (typeof omadacId === 'string' && omadacId.length > 0) {
        result.omadacId = omadacId;
    }

    return result;
}

/**
 * Build a full OmadaConnectionConfig by merging environment config with header-supplied credentials.
 * Environment variable values always win over header values.
 * Throws if any required credential field is absent from both env and headers.
 */
export function resolveOmadaConfig(
    config: EnvironmentConfig,
    headerAuth: {
        authMode?: 'oauth' | 'web';
        clientId?: string;
        clientSecret?: string;
        webUsername?: string;
        webPassword?: string;
        omadacId?: string;
    }
): OmadaConnectionConfig {
    const authMode = headerAuth.authMode ?? config.authMode ?? 'oauth';
    const clientId = config.clientId ?? headerAuth.clientId;
    const clientSecret = config.clientSecret ?? headerAuth.clientSecret;
    const webUsername = config.webUsername ?? headerAuth.webUsername;
    const webPassword = config.webPassword ?? headerAuth.webPassword;
    const omadacId = config.omadacId ?? headerAuth.omadacId;

    if (authMode === 'oauth' && !clientId) {
        throw new Error('Missing required Omada credentials: set OMADA_CLIENT_ID env var or x-omada-client-id header');
    }
    if (authMode === 'oauth' && !clientSecret) {
        throw new Error('Missing required Omada credentials: set OMADA_CLIENT_SECRET env var or x-omada-client-secret header');
    }
    if (authMode === 'web' && !webUsername) {
        throw new Error('Missing required Omada credentials: set OMADA_WEB_USERNAME env var or x-omada-web-username header');
    }
    if (authMode === 'web' && !webPassword) {
        throw new Error('Missing required Omada credentials: set OMADA_WEB_PASSWORD env var or x-omada-web-password header');
    }
    if (!omadacId) {
        throw new Error('Missing required Omada credentials: set OMADA_OMADAC_ID env var or x-omada-omadac-id header');
    }

    return {
        baseUrl: config.baseUrl,
        authMode,
        clientId,
        clientSecret,
        webUsername,
        webPassword,
        omadacId,
        siteId: config.siteId,
        strictSsl: config.strictSsl,
        requestTimeout: config.requestTimeout,
    };
}
