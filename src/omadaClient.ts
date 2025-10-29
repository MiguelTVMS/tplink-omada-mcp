import https from 'node:https';

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

import { EnvironmentConfig } from './config.js';
import {
  ApiItemResponse,
  ApiListResponse,
  OmadaClientDevice,
  OmadaDevice,
  OmadaLoginResult,
  OmadaSite
} from './types.js';

export type OmadaClientOptions = EnvironmentConfig;

function normalizeCookieHeader(values: string[] | undefined): string | undefined {
  if (!values?.length) {
    return undefined;
  }

  return values
    .map((cookie) => cookie.split(';')[0])
    .filter(Boolean)
    .join('; ');
}

export class OmadaClient {
  private readonly http: AxiosInstance;

  private token?: string;

  private cookieHeader?: string;

  private readonly username: string;

  private readonly password: string;

  private readonly siteId?: string;

  constructor(private readonly options: OmadaClientOptions) {
    this.username = options.username;
    this.password = options.password;
    this.siteId = options.siteId;

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

  public async listSites(): Promise<OmadaSite[]> {
    const response = await this.get<ApiListResponse<OmadaSite>>('/api/v2/sites');
    return response.result?.data ?? [];
  }

  public async listDevices(siteId?: string): Promise<OmadaDevice[]> {
    const response = await this.get<ApiListResponse<OmadaDevice>>(
      `/api/v2/sites/${this.resolveSiteId(siteId)}/devices`,
    );
    return response.result?.data ?? [];
  }

  public async listClients(siteId?: string): Promise<OmadaClientDevice[]> {
    const response = await this.get<ApiListResponse<OmadaClientDevice>>(
      `/api/v2/sites/${this.resolveSiteId(siteId)}/clients`,
    );
    return response.result?.data ?? [];
  }

  public async getDevice(deviceId: string, siteId?: string): Promise<OmadaDevice | undefined> {
    const response = await this.get<ApiItemResponse<OmadaDevice>>(
      `/api/v2/sites/${this.resolveSiteId(siteId)}/devices/${deviceId}`,
    );
    return response.result;
  }

  public async getClient(clientId: string, siteId?: string): Promise<OmadaClientDevice | undefined> {
    const response = await this.get<ApiItemResponse<OmadaClientDevice>>(
      `/api/v2/sites/${this.resolveSiteId(siteId)}/clients/${clientId}`,
    );
    return response.result;
  }

  public async callApi<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.request<T>(config);
    return response;
  }

  private async get<T>(path: string): Promise<T> {
    return this.request<T>({ method: 'GET', url: path });
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

  private async ensureAuthenticated(force = false): Promise<void> {
    if (this.token && !force) {
      return;
    }

    const response = await this.http.post<OmadaLoginResult>(
      '/api/v2/login',
      {
        username: this.username,
        password: this.password,
        timeout: 28800
      },
      { headers: { Cookie: this.cookieHeader } }
    );

    const cookie = normalizeCookieHeader(response.headers['set-cookie']);
    if (cookie) {
      this.cookieHeader = cookie;
    }

    if (response.data.errorCode !== 0) {
      throw new Error(response.data.msg ?? 'Failed to authenticate with the Omada controller');
    }

    const token = response.data.result?.token;
    if (!token) {
      throw new Error('The Omada controller did not return an authentication token');
    }

    this.token = token;
  }

  private async request<T>(config: AxiosRequestConfig, retry = true): Promise<T> {
    await this.ensureAuthenticated();

    const requestConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        ...(config.headers ?? {}),
        ...(this.cookieHeader ? { Cookie: this.cookieHeader } : {})
      },
      params: {
        ...(config.params ?? {}),
        ...(this.token ? { token: this.token } : {})
      }
    };

    try {
      const response = await this.http.request<T>(requestConfig);
      return response.data;
    } catch (error) {
      if (!retry || !axios.isAxiosError(error)) {
        throw error;
      }

      const status = error.response?.status;
      const errorCode = (error.response?.data as { errorCode?: number } | undefined)?.errorCode;

      if (status === 401 || errorCode === -1601 || errorCode === -1602) {
        this.token = undefined;
        await this.ensureAuthenticated(true);
        return this.request<T>(config, false);
      }

      throw error;
    }
  }
}
