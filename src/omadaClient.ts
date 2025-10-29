import https from 'node:https';

import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

import type { EnvironmentConfig } from './config.js';
import type {
  OmadaApiResponse,
  OmadaClientInfo,
  OmadaDeviceInfo,
  OmadaSiteSummary,
  PaginatedResult,
  TokenResult
} from './types.js';
import { logger } from './utils/logger.js';

export type OmadaClientOptions = EnvironmentConfig;

const TOKEN_EXPIRY_BUFFER_SECONDS = 30;
const DEFAULT_PAGE_SIZE = 200;

export class OmadaClient {
  private readonly http: AxiosInstance;

  private accessToken?: string;

  private refreshToken?: string;

  private tokenExpiresAt?: number;

  private readonly siteId?: string;

  private readonly omadacId: string;

  private readonly clientId: string;

  private readonly clientSecret: string;

  constructor(options: OmadaClientOptions) {
    this.siteId = options.siteId;
    this.clientId = options.clientId;
    this.clientSecret = options.clientSecret;
    this.omadacId = options.omadacId;

    const httpsAgent = options.proxyUrl
      ? new HttpsProxyAgent(options.proxyUrl)
      : new https.Agent({ rejectUnauthorized: options.strictSsl });

    const axiosOptions: AxiosRequestConfig = {
      baseURL: options.baseUrl,
      httpsAgent,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    };

    if (options.proxyUrl) {
      axiosOptions.proxy = false;
    }

    if (options.requestTimeout) {
      axiosOptions.timeout = options.requestTimeout;
    }

    this.http = axios.create(axiosOptions);
  }

  public async listSites(): Promise<OmadaSiteSummary[]> {
    return this.fetchPaginated<OmadaSiteSummary>(this.buildOmadaPath('/sites'));
  }

  public async listDevices(siteId?: string): Promise<OmadaDeviceInfo[]> {
    const resolvedSiteId = this.resolveSiteId(siteId);
    return this.fetchPaginated<OmadaDeviceInfo>(
      this.buildOmadaPath(`/sites/${encodeURIComponent(resolvedSiteId)}/devices`)
    );
  }

  public async listClients(siteId?: string): Promise<OmadaClientInfo[]> {
    const resolvedSiteId = this.resolveSiteId(siteId);
    return this.fetchPaginated<OmadaClientInfo>(
      this.buildOmadaPath(`/sites/${encodeURIComponent(resolvedSiteId)}/clients`)
    );
  }

  public async getDevice(identifier: string, siteId?: string): Promise<OmadaDeviceInfo | undefined> {
    const devices = await this.listDevices(siteId);
    return devices.find((device) => device.mac === identifier || device.deviceId === identifier);
  }

  public async getClient(identifier: string, siteId?: string): Promise<OmadaClientInfo | undefined> {
    const clients = await this.listClients(siteId);
    return clients.find((client) => client.mac === identifier || client.id === identifier);
  }

  public async callApi<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return this.request<T>(config);
  }

  private async fetchPaginated<T>(
    path: string,
    params: Record<string, unknown> = {}
  ): Promise<T[]> {
    const records: T[] = [];
    let page = 1;
    let totalRows: number | undefined;

    // Fetch sequential pages because OpenAPI requires explicit pagination parameters.
    do {
      const response = await this.get<OmadaApiResponse<PaginatedResult<T>>>(path, {
        ...params,
        page,
        pageSize: DEFAULT_PAGE_SIZE
      });

      const result = this.ensureSuccess(response);
      const pageData = result.data ?? [];
      totalRows = result.totalRows ?? totalRows;

      records.push(...pageData);
      page += 1;

      if (pageData.length === 0) {
        break;
      }
    } while (!totalRows || records.length < totalRows);

    return records;
  }

  private buildOmadaPath(relativePath: string): string {
    const normalized = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    return `/openapi/v1/${encodeURIComponent(this.omadacId)}${normalized}`;
  }

  private resolveSiteId(siteId?: string): string {
    if (siteId) {
      return siteId;
    }

    if (this.siteId) {
      return this.siteId;
    }

    throw new Error('A site id must be provided either in the environment or as a parameter.');
  }

  private ensureSuccess<T>(response: OmadaApiResponse<T>): T {
    if (response.errorCode !== 0) {
      throw new Error(response.msg ?? 'Omada API request failed');
    }

    return (response.result ?? ({} as T)) as T;
  }

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

  private async authenticate(grantType: 'client_credentials' | 'refresh_token'): Promise<void> {
    const params: Record<string, string> = { grant_type: grantType };
    const body: Record<string, string> = {
      client_id: this.clientId,
      client_secret: this.clientSecret
    };

    if (grantType === 'client_credentials') {
      body.omadacId = this.omadacId;
    } else {
      if (!this.refreshToken) {
        throw new Error('No refresh token available to refresh the access token');
      }

      params.refresh_token = this.refreshToken;
    }

    const { data } = await this.http.post<OmadaApiResponse<TokenResult>>(
      '/openapi/authorize/token',
      body,
      { params }
    );

    const token = this.ensureSuccess(data);
    this.setToken(token);
  }

  private setToken(token: TokenResult): void {
    this.accessToken = token.accessToken;
    this.refreshToken = token.refreshToken;

    const expiresInSeconds = Number.isFinite(token.expiresIn) ? token.expiresIn : 0;
    const expiresInMs = Math.max(expiresInSeconds - TOKEN_EXPIRY_BUFFER_SECONDS, 0) * 1000;
    this.tokenExpiresAt = Date.now() + expiresInMs;
  }

  private clearToken(): void {
    this.accessToken = undefined;
    this.refreshToken = undefined;
    this.tokenExpiresAt = undefined;
  }

  private async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    return this.request<T>({ method: 'GET', url: path, params });
  }

  private isAuthErrorCode(errorCode?: number): boolean {
    if (errorCode === undefined) {
      return false;
    }

    return [-44106, -44111, -44112, -44113, -44114, -44116].includes(errorCode);
  }

  private async request<T>(config: AxiosRequestConfig, retry = true): Promise<T> {
    await this.ensureAccessToken();

    const requestConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        ...(config.headers ?? {}),
        Authorization: `AccessToken=${this.accessToken ?? ''}`
      }
    };

    const method = (requestConfig.method ?? 'GET').toUpperCase();
    const url = requestConfig.url ?? 'unknown-url';
    logger.info('Omada request', {
      method,
      url,
      params: requestConfig.params,
      siteId: requestConfig.params?.siteId ?? undefined
    });

    try {
      const response = await this.http.request<T>(requestConfig);
      logger.info('Omada response', {
        method,
        url,
        status: response.status
      });
      return response.data;
    } catch (error) {
      logger.error('Omada request failed', {
        method,
        url,
        message: error instanceof Error ? error.message : String(error)
      });
      if (!retry || !axios.isAxiosError(error)) {
        throw error;
      }

      const status = error.response?.status;
      const errorCode = (error.response?.data as { errorCode?: number } | undefined)?.errorCode;

      if (status === 401 || status === 403 || this.isAuthErrorCode(errorCode)) {
        this.clearToken();
        await this.ensureAccessToken();
        return this.request<T>(config, false);
      }

      throw error;
    }
  }
}
