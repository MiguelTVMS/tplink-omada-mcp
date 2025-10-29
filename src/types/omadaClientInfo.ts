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
