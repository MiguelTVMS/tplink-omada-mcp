export interface OmadaSiteSummary {
  siteId: string;
  name: string;
  [key: string]: unknown;
}

export interface OmadaDeviceInfo {
  mac: string;
  name?: string;
  deviceId?: string;
  type?: string;
  model?: string;
  ip?: string;
  status?: string;
  siteId?: string;
  [key: string]: unknown;
}

export interface OmadaClientInfo {
  id?: string;
  mac: string;
  name?: string;
  hostName?: string;
  deviceType?: string;
  ssid?: string;
  ip?: string;
  siteId?: string;
  [key: string]: unknown;
}

export interface OmadaApiResponse<T> {
  errorCode: number;
  msg?: string;
  result?: T;
}

export interface PaginatedResult<T> {
  totalRows?: number;
  currentPage?: number;
  currentSize?: number;
  data?: T[];
}

export interface TokenResult {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
}
