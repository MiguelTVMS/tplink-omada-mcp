import type { AxiosInstance } from 'axios';

import { logger } from '../utils/logger.js';

/**
 * Authentication state management for the Omada internal (web UI) API.
 * Uses cookie-based sessions with CSRF tokens instead of OAuth bearer tokens.
 */
export class InternalAuthManager {
    private csrfToken?: string;

    private sessionCookie?: string;

    constructor(
        private readonly http: AxiosInstance,
        private readonly username: string,
        private readonly password: string,
        private readonly omadacId: string
    ) {}

    /**
     * Get the current CSRF token, logging in if necessary.
     */
    public async getCsrfToken(): Promise<string> {
        if (!this.csrfToken || !this.sessionCookie) {
            await this.login();
        }
        return this.csrfToken ?? '';
    }

    /**
     * Get the current session cookie.
     */
    public async getSessionCookie(): Promise<string> {
        if (!this.csrfToken || !this.sessionCookie) {
            await this.login();
        }
        return this.sessionCookie ?? '';
    }

    /**
     * Clear the current session, forcing re-login on next request.
     */
    public clearSession(): void {
        this.csrfToken = undefined;
        this.sessionCookie = undefined;
    }

    /**
     * Check if web credentials are configured.
     */
    public isConfigured(): boolean {
        return Boolean(this.username && this.password);
    }

    /**
     * Log in to the internal web UI API and extract session cookie + CSRF token.
     */
    private async login(): Promise<void> {
        const loginPath = `/${encodeURIComponent(this.omadacId)}/api/v2/login`;

        try {
            const response = await this.http.post(loginPath, { username: this.username, password: this.password }, { withCredentials: true });

            const data = response.data as { errorCode?: number; msg?: string; result?: { token?: string } };

            if (data.errorCode !== 0) {
                logger.error('Internal API login error', {
                    errorCode: data.errorCode,
                    message: data.msg,
                });
                throw new Error(data.msg ?? 'Internal API login failed');
            }

            // Extract CSRF token from response body
            const token = data.result?.token;
            if (!token) {
                throw new Error('Internal API login succeeded but no CSRF token returned');
            }
            this.csrfToken = token;

            // Extract session cookie from Set-Cookie header
            const setCookieHeader = response.headers['set-cookie'];
            if (setCookieHeader) {
                // Collect all cookie name=value pairs
                const cookies = (Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader])
                    .map((c: string) => c.split(';')[0].trim())
                    .filter(Boolean);
                this.sessionCookie = cookies.join('; ');
            }

            if (!this.sessionCookie) {
                logger.warn('Internal API login succeeded but no session cookie received; requests may fail');
            }

            logger.info('Internal API login successful');
        } catch (error) {
            logger.error('Internal API login failed', {
                baseUrl: this.http.defaults.baseURL,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
}
