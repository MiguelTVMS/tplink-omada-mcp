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
