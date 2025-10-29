export interface OswStackDetail {
    id?: string;
    name?: string;
    siteId?: string;
    masterMac?: string;
    stackDevice?: boolean;
    member?: Array<Record<string, unknown>>;
    ports?: Array<Record<string, unknown>>;
    lags?: Array<Record<string, unknown>>;
    [key: string]: unknown;
}
