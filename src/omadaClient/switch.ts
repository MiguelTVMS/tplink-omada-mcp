import type { OmadaApiResponse } from '../types/index.js';

import type { RequestHandler } from './request.js';
import type { SiteOperations } from './site.js';

/**
 * Switch port and cable test operations for the Omada API.
 * Covers single-port config, batch operations, cable tests, and switch networks.
 */
export class SwitchOperations {
    constructor(
        private readonly request: RequestHandler,
        private readonly site: SiteOperations,
        private readonly buildPath: (path: string, version?: string) => string
    ) {}

    /**
     * Get full switch info including portList array (v1 API).
     */
    public async getSwitch(switchMac: string, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/switches/${encodeURIComponent(switchMac)}`);
        const response = await this.request.get<OmadaApiResponse<unknown>>(path);
        return this.request.ensureSuccess(response);
    }

    /**
     * Set a LAN profile on a single switch port (v1 API).
     */
    public async setSwitchPortProfile(switchMac: string, port: number, profileId: string, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/switches/${encodeURIComponent(switchMac)}/ports/${port}/profile`);
        const response = await this.request.put<OmadaApiResponse<unknown>>(path, { profileId });
        return this.request.ensureSuccess(response);
    }

    /**
     * Set PoE mode on a single switch port (v1 API).
     * @param poeMode - 1=on(802.3at/af), 0=off
     */
    public async setSwitchPortPoe(switchMac: string, port: number, poeMode: number, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/switches/${encodeURIComponent(switchMac)}/ports/${port}/poe-mode`);
        const response = await this.request.put<OmadaApiResponse<unknown>>(path, { poeMode });
        return this.request.ensureSuccess(response);
    }

    /**
     * Set the name of a single switch port (v1 API).
     * @param name - Port name, 1-128 characters
     */
    public async setSwitchPortName(switchMac: string, port: number, name: string, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/switches/${encodeURIComponent(switchMac)}/ports/${port}/name`);
        const response = await this.request.put<OmadaApiResponse<unknown>>(path, { name });
        return this.request.ensureSuccess(response);
    }

    /**
     * Enable or disable a single switch port (v1 API).
     * @param status - 0=off, 1=on
     */
    public async setSwitchPortStatus(switchMac: string, port: number, status: number, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/switches/${encodeURIComponent(switchMac)}/ports/${port}/status`);
        const response = await this.request.put<OmadaApiResponse<unknown>>(path, { status });
        return this.request.ensureSuccess(response);
    }

    /**
     * Enable or disable profile override on a single switch port (v1 API).
     */
    public async setSwitchPortProfileOverride(switchMac: string, port: number, profileOverrideEnable: boolean, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(
            `/sites/${encodeURIComponent(resolvedSiteId)}/switches/${encodeURIComponent(switchMac)}/ports/${port}/profile-override`
        );
        const response = await this.request.put<OmadaApiResponse<unknown>>(path, { profileOverrideEnable });
        return this.request.ensureSuccess(response);
    }

    /**
     * Batch set profile override on multiple switch ports (v1 API).
     */
    public async batchSetSwitchPortProfile(switchMac: string, portList: number[], profileOverrideEnable: boolean, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(
            `/sites/${encodeURIComponent(resolvedSiteId)}/switches/${encodeURIComponent(switchMac)}/multi-ports/profile-override`
        );
        const response = await this.request.put<OmadaApiResponse<unknown>>(path, { portList, profileOverrideEnable });
        return this.request.ensureSuccess(response);
    }

    /**
     * Batch set PoE mode on multiple switch ports (v1 API).
     * @param poeMode - 1=on(802.3at/af), 0=off
     */
    public async batchSetSwitchPortPoe(switchMac: string, portList: number[], poeMode: number, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/switches/${encodeURIComponent(switchMac)}/multi-ports/poe-mode`);
        const response = await this.request.put<OmadaApiResponse<unknown>>(path, { portList, poeMode });
        return this.request.ensureSuccess(response);
    }

    /**
     * Batch enable or disable multiple switch ports (v1 API).
     * @param status - 0=off, 1=on
     */
    public async batchSetSwitchPortStatus(switchMac: string, portList: number[], status: number, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/switches/${encodeURIComponent(switchMac)}/multi-ports/status`);
        const response = await this.request.put<OmadaApiResponse<unknown>>(path, { portList, status });
        return this.request.ensureSuccess(response);
    }

    /**
     * Batch set names on multiple switch ports (v1 API).
     */
    public async batchSetSwitchPortName(switchMac: string, portNameList: Array<{ port: number; name: string }>, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/switches/${encodeURIComponent(switchMac)}/multi-ports/name`);
        const response = await this.request.put<OmadaApiResponse<unknown>>(path, { portNameList });
        return this.request.ensureSuccess(response);
    }

    /**
     * Start a cable test on a switch (v1 API).
     */
    public async startCableTest(switchMac: string, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/cable-test/switches/${encodeURIComponent(switchMac)}/start`);
        const response = await this.request.post<OmadaApiResponse<unknown>>(path, {});
        return this.request.ensureSuccess(response);
    }

    /**
     * Get cable test results for a switch (v1 API).
     */
    public async getCableTestResults(switchMac: string, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/cable-test/switches/${encodeURIComponent(switchMac)}/full-results`);
        const response = await this.request.get<OmadaApiResponse<unknown>>(path);
        return this.request.ensureSuccess(response);
    }

    /**
     * Get switch networks / VLAN trunking config (v1 API).
     */
    public async getSwitchNetworks(switchMac: string, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/switches/${encodeURIComponent(switchMac)}/networks`);
        const response = await this.request.get<OmadaApiResponse<unknown>>(path);
        return this.request.ensureSuccess(response);
    }

    /**
     * Set switch networks / VLAN trunking config (v1 API).
     */
    public async setSwitchNetworks(switchMac: string, data: Record<string, unknown>, siteId?: string): Promise<unknown> {
        const resolvedSiteId = this.site.resolveSiteId(siteId);
        const path = this.buildPath(`/sites/${encodeURIComponent(resolvedSiteId)}/switches/${encodeURIComponent(switchMac)}/networks`);
        const response = await this.request.post<OmadaApiResponse<unknown>>(path, data);
        return this.request.ensureSuccess(response);
    }
}
