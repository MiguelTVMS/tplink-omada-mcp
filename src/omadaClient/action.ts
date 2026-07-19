import type { OmadaApiResponse } from '../types/index.js';

import type { RequestHandler } from './request.js';
import type { SiteOperations } from './site.js';

/**
 * Device and client action operations for the Omada API.
 * Covers reboot, adopt, block, and unblock actions.
 */
export class ActionOperations {
    constructor(
        private readonly request: RequestHandler,
        private readonly site: SiteOperations,
        private readonly buildPath: (path: string, version?: string) => string
    ) {}

    /**
     * Reboot a device by MAC address (v1 API).
     */
    public async rebootDevice(deviceMac: string, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/devices/${encodeURIComponent(deviceMac)}/reboot`);
        const response = await this.request.post<OmadaApiResponse<unknown>>(path, {});
        return this.request.ensureSuccess(response);
    }

    /**
     * Adopt a device by MAC address (v1 API).
     */
    public async adoptDevice(deviceMac: string, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/cmd/adopts`);
        const response = await this.request.post<OmadaApiResponse<unknown>>(path, { macs: [deviceMac] });
        return this.request.ensureSuccess(response);
    }

    /**
     * Block a client by MAC address (v1 API).
     */
    public async blockClient(clientMac: string, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/clients/${encodeURIComponent(clientMac)}/block`);
        const response = await this.request.post<OmadaApiResponse<unknown>>(path, {});
        return this.request.ensureSuccess(response);
    }

    /**
     * Unblock a client by MAC address (v1 API).
     */
    public async unblockClient(clientMac: string, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/clients/${encodeURIComponent(clientMac)}/unblock`);
        const response = await this.request.post<OmadaApiResponse<unknown>>(path, {});
        return this.request.ensureSuccess(response);
    }

    /**
     * Reconnect a client by MAC address (v1 API).
     */
    public async reconnectClient(clientMac: string, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/clients/${encodeURIComponent(clientMac)}/reconnect`);
        const response = await this.request.post<OmadaApiResponse<unknown>>(path, {});
        return this.request.ensureSuccess(response);
    }

    /**
     * Update a client's settings (v1 API).
     */
    public async updateClient(clientMac: string, data: Record<string, unknown>, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/clients/${encodeURIComponent(clientMac)}`);
        const response = await this.request.request<OmadaApiResponse<unknown>>({ method: 'PATCH', url: path, data });
        return this.request.ensureSuccess(response);
    }

    /**
     * Set device LED setting (v1 API).
     */
    public async setDeviceLed(deviceMac: string, ledSetting: number, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/devices/${encodeURIComponent(deviceMac)}/led-setting`);
        const response = await this.request.post<OmadaApiResponse<unknown>>(path, { ledSetting });
        return this.request.ensureSuccess(response);
    }

    /**
     * Get firmware details for a device (v1 API).
     */
    public async getFirmwareDetails(deviceMac: string, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/devices/${encodeURIComponent(deviceMac)}/firmware`);
        const response = await this.request.get<OmadaApiResponse<unknown>>(path);
        return this.request.ensureSuccess(response);
    }

    /**
     * Start firmware upgrade for a device (v1 API).
     */
    public async startFirmwareUpgrade(deviceMac: string, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/devices/${encodeURIComponent(deviceMac)}/firmware/upgrade`);
        const response = await this.request.post<OmadaApiResponse<unknown>>(path, {});
        return this.request.ensureSuccess(response);
    }

    /**
     * Connect or disconnect a gateway WAN port (v1 API).
     */
    public async setGatewayWanConnect(gatewayMac: string, portId: string, action: 'connect' | 'disconnect', siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(
            `/sites/${encodeURIComponent(resolvedSiteId)}/gateways/${encodeURIComponent(gatewayMac)}/wan/${encodeURIComponent(portId)}/${action}`
        );
        const response = await this.request.post<OmadaApiResponse<unknown>>(path, {});
        return this.request.ensureSuccess(response);
    }
}
