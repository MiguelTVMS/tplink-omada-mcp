import type { AxiosInstance } from 'axios';

import type { OmadaApiResponse, TokenResult } from '../types/index.js';
import { logger } from '../utils/logger.js';

const TOKEN_EXPIRY_BUFFER_SECONDS = 30;

export type AuthMode = 'oauth' | 'web';

export interface RequestAuthManager {
    getAuthHeaders(): Promise<Record<string, string>>;
    clearToken(): void;
}

/**
 * Authentication state management for the Omada client.
 */
export class AuthManager implements RequestAuthManager {
    private accessToken?: string;

    private refreshToken?: string;

    private tokenExpiresAt?: number;

    constructor(
        private readonly http: AxiosInstance,
        private readonly clientId: string,
        private readonly clientSecret: string,
        private readonly omadacId: string
    ) {}

    /**
     * Get the current access token, refreshing if necessary.
     */
    public async getAccessToken(): Promise<string> {
        await this.ensureAccessToken();
        return this.accessToken ?? '';
    }

    public async getAuthHeaders(): Promise<Record<string, string>> {
        const accessToken = await this.getAccessToken();
        return { Authorization: `AccessToken=${accessToken}` };
    }

    /**
     * Clear the current authentication token.
     */
    public clearToken(): void {
        this.accessToken = undefined;
        this.refreshToken = undefined;
        this.tokenExpiresAt = undefined;
    }

    /**
     * Ensure a valid access token is available, refreshing or re-authenticating if necessary.
     */
    private async ensureAccessToken(): Promise<void> {
        if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
            return;
        }

        if (this.refreshToken) {
            try {
                await this.authenticate('refresh_token');
                return;
            } catch {
                this.clearToken();
            }
        }

        await this.authenticate('client_credentials');
    }

    /**
     * Authenticate with the Omada controller using the specified grant type.
     */
    private async authenticate(grantType: 'client_credentials' | 'refresh_token'): Promise<void> {
        const params: Record<string, string> = { grant_type: grantType };
        const body: Record<string, string> = {
            client_id: this.clientId,
            client_secret: this.clientSecret,
        };

        if (grantType === 'client_credentials') {
            body.omadacId = this.omadacId;
        } else {
            if (!this.refreshToken) {
                throw new Error('No refresh token available to refresh the access token');
            }

            params.refresh_token = this.refreshToken;
        }

        try {
            const { data } = await this.http.post<OmadaApiResponse<TokenResult>>('/openapi/authorize/token', body, { params });

            if (data.errorCode !== 0) {
                logger.error('Omada authentication error', {
                    errorCode: data.errorCode,
                    message: data.msg,
                });
                throw new Error(data.msg ?? 'Omada authentication failed');
            }

            const token = data.result ?? ({} as TokenResult);
            this.setToken(token);
        } catch (error) {
            logger.error('Omada authentication failed', {
                grantType,
                baseUrl: this.http.defaults.baseURL,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    /**
     * Store the authentication token and calculate expiration time.
     */
    private setToken(token: TokenResult): void {
        this.accessToken = token.accessToken;
        this.refreshToken = token.refreshToken;

        const expiresInSeconds = Number.isFinite(token.expiresIn) ? token.expiresIn : 0;
        const expiresInMs = Math.max(expiresInSeconds - TOKEN_EXPIRY_BUFFER_SECONDS, 0) * 1000;
        this.tokenExpiresAt = Date.now() + expiresInMs;
    }
}

/**
 * Fusion gateway web-session authentication for OpenAPI requests.
 */
export class WebAuthManager implements RequestAuthManager {
    private csrfToken?: string;

    private sessionCookie?: string;

    constructor(
        private readonly http: AxiosInstance,
        private readonly username: string,
        private readonly password: string,
        private readonly omadacId: string
    ) {}

    public async getAuthHeaders(): Promise<Record<string, string>> {
        await this.ensureSession();

        const headers: Record<string, string> = {
            'Csrf-Token': this.csrfToken ?? '',
            'Omada-Request-Source': 'web-local',
        };

        if (this.sessionCookie) {
            headers.Cookie = this.sessionCookie;
        }

        return headers;
    }

    public clearToken(): void {
        this.csrfToken = undefined;
        this.sessionCookie = undefined;
    }

    private async ensureSession(): Promise<void> {
        if (this.csrfToken) {
            return;
        }

        await this.login();
    }

    private async login(): Promise<void> {
        const loginPath = `/${encodeURIComponent(this.omadacId)}/api/v2/login`;

        try {
            const response = await this.http.post(loginPath, { username: this.username, password: this.password }, { withCredentials: true });
            const data = response.data as { errorCode?: number; msg?: string; result?: { token?: string } };

            if (data.errorCode !== 0) {
                logger.error('Omada web authentication error', {
                    errorCode: data.errorCode,
                    message: data.msg,
                });
                throw new Error(data.msg ?? 'Omada web authentication failed');
            }

            const token = data.result?.token;
            if (!token) {
                throw new Error('Omada web authentication succeeded but no CSRF token returned');
            }

            this.csrfToken = token;
            this.sessionCookie = this.extractSessionCookie(response.headers['set-cookie']);

            logger.info('Omada web authentication successful');
        } catch (error) {
            logger.error('Omada web authentication failed', {
                baseUrl: this.http.defaults.baseURL,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    private extractSessionCookie(setCookieHeader: unknown): string | undefined {
        if (!setCookieHeader) {
            return undefined;
        }

        const headers = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
        const cookies = headers.map((cookie) => String(cookie).split(';')[0].trim()).filter(Boolean);

        return cookies.length > 0 ? cookies.join('; ') : undefined;
    }
}
