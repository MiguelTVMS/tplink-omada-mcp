import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosRequestHeaders } from 'axios';

import type { OmadaApiResponse } from '../types/index.js';
import { logger } from '../utils/logger.js';

import type { InternalAuthManager } from './internalAuth.js';

/**
 * HTTP request handler for Omada internal (web UI) API calls.
 * Uses cookie + Csrf-Token header instead of bearer token authentication.
 * The internal API base path is /{omadacId}/api/v2 (not /openapi/v1/{omadacId}).
 */
export class InternalRequestHandler {
    constructor(
        private readonly http: AxiosInstance,
        private readonly auth: InternalAuthManager,
        private readonly omadacId: string
    ) {}

    /**
     * Make a GET request to the internal API.
     */
    public async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
        return await this.request<T>({ method: 'GET', url: this.buildInternalPath(path), params });
    }

    /**
     * Make a POST request to the internal API.
     */
    public async post<T>(path: string, data: unknown, params?: Record<string, unknown>): Promise<T> {
        return await this.request<T>({ method: 'POST', url: this.buildInternalPath(path), data, params });
    }

    /**
     * Make a DELETE request to the internal API.
     */
    public async delete<T>(path: string, params?: Record<string, unknown>): Promise<T> {
        return await this.request<T>({ method: 'DELETE', url: this.buildInternalPath(path), params });
    }

    /**
     * Ensure an internal API response indicates success.
     * @throws {Error} If the response contains an error code
     */
    public ensureSuccess<T>(response: OmadaApiResponse<T>): T {
        if (response.errorCode !== 0) {
            logger.error('Internal API error', {
                errorCode: response.errorCode,
                message: response.msg,
            });
            throw new Error(response.msg ?? 'Internal API request failed');
        }

        return (response.result ?? ({} as T)) as T;
    }

    /**
     * Build the internal API path: /{omadacId}/api/v2{relativePath}
     */
    private buildInternalPath(relativePath: string): string {
        const normalized = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
        return `/${encodeURIComponent(this.omadacId)}/api/v2${normalized}`;
    }

    /**
     * Make an authenticated request to the internal API with retry on session expiry.
     */
    private async request<T>(config: AxiosRequestConfig, retry = true): Promise<T> {
        const csrfToken = await this.auth.getCsrfToken();
        const sessionCookie = await this.auth.getSessionCookie();

        const requestConfig: AxiosRequestConfig = {
            ...config,
            headers: {
                ...(config.headers ?? {}),
                'Csrf-Token': csrfToken,
                Cookie: sessionCookie,
            },
            withCredentials: true,
        };

        const method = (requestConfig.method ?? 'GET').toUpperCase();
        const url = requestConfig.url ?? 'unknown-url';
        logger.info('Internal API request', {
            method,
            url,
            params: requestConfig.params,
        });

        logger.debug('Internal API request details', {
            method,
            url,
            headers: this.sanitizeHeaders(requestConfig.headers as AxiosRequestHeaders | undefined),
            params: requestConfig.params ?? null,
            data: this.sanitizePayload(requestConfig.data),
        });

        try {
            const response = await this.http.request<T>(requestConfig);
            logger.info('Internal API response', {
                method,
                url,
                status: response.status,
            });

            logger.debug('Internal API response payload', {
                method,
                url,
                status: response.status,
                data: this.sanitizePayload(response.data),
            });

            // Check for session expiry in response
            const errorCode = (response.data as { errorCode?: number } | undefined)?.errorCode;
            const errorMsg = (response.data as { msg?: string } | undefined)?.msg;

            if (retry && this.isSessionExpired(errorCode, errorMsg)) {
                logger.warn('Internal API session expired, re-logging in', { method, url, errorCode });
                this.auth.clearSession();
                return this.request<T>(config, false);
            }

            return response.data;
        } catch (error) {
            logger.error('Internal API request failed', {
                method,
                url,
                message: error instanceof Error ? error.message : String(error),
            });

            if (!retry || !axios.isAxiosError(error)) {
                throw error;
            }

            const status = error.response?.status;
            if (status === 401 || status === 403) {
                this.auth.clearSession();
                return this.request<T>(config, false);
            }

            throw error;
        }
    }

    /**
     * Check if the error indicates an expired or invalid session.
     */
    private isSessionExpired(errorCode?: number, message?: string): boolean {
        // Common internal API auth error codes
        if (errorCode === -44106 || errorCode === -44112 || errorCode === -44113) {
            return true;
        }
        if (message) {
            const lower = message.toLowerCase();
            return lower.includes('token expired') || lower.includes('session expired') || lower.includes('not logged in');
        }
        return false;
    }

    /**
     * Sanitize HTTP headers for logging, masking sensitive values.
     */
    private sanitizeHeaders(headers: AxiosRequestHeaders | undefined): Record<string, unknown> | undefined {
        if (!headers) {
            return undefined;
        }

        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(headers)) {
            sanitized[key] = this.isSensitiveKey(key) ? '********' : value;
        }

        return sanitized;
    }

    /**
     * Sanitize a payload for logging, masking sensitive values.
     */
    private sanitizePayload(payload: unknown): unknown {
        if (!payload || typeof payload !== 'object') {
            return payload;
        }

        if (Array.isArray(payload)) {
            return payload.map((item) => this.sanitizePayload(item));
        }

        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(payload)) {
            sanitized[key] = this.isSensitiveKey(key) ? '********' : this.sanitizePayload(value);
        }

        return sanitized;
    }

    /**
     * Check if a key name indicates sensitive data.
     */
    private isSensitiveKey(key: string): boolean {
        const normalized = key.toLowerCase();
        return (
            normalized.includes('cookie') ||
            normalized.includes('csrf') ||
            normalized.includes('token') ||
            normalized.includes('password') ||
            normalized.includes('secret')
        );
    }
}
