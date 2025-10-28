export interface OmadaSite {
  id: string;
  name: string;
  description?: string;
  role?: string;
}

export interface OmadaDevice {
  id: string;
  name: string;
  mac: string;
  model?: string;
  ip?: string;
  type?: string;
  status?: string;
  siteId?: string;
}

export interface OmadaClientDevice {
  id: string;
  name?: string;
  mac: string;
  ip?: string;
  type?: string;
  isBlocked?: boolean;
  ssid?: string;
  siteId?: string;
}

export interface ApiListResponse<T> {
  errorCode: number;
  msg?: string;
  result?: {
    data?: T[];
    [key: string]: unknown;
  };
}

export interface ApiItemResponse<T> {
  errorCode: number;
  msg?: string;
  result?: T;
}

export interface OmadaLoginResult {
  errorCode: number;
  msg?: string;
  result?: {
    token?: string;
    timeout?: number;
    role?: string;
    url?: string;
    [key: string]: unknown;
  };
}
