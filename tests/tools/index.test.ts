import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { OmadaClient } from '../../src/omadaClient/index.js';
import { registerAllTools } from '../../src/tools/index.js';

describe('tools/index', () => {
    let mockServer: McpServer;
    let mockClient: OmadaClient;

    beforeEach(() => {
        mockServer = {
            registerTool: vi.fn(),
        } as unknown as McpServer;

        mockClient = {} as OmadaClient;
    });

    describe('registerAllTools', () => {
        it('should register all tools with the server', () => {
            registerAllTools(mockServer, mockClient);

            // Verify registerTool was called for each tool
            expect(mockServer.registerTool).toHaveBeenCalledWith('listSites', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listDevices', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listClients', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDevice', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchStackDetail', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getClient', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('searchDevices', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listDevicesStats', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listMostActiveClients', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listClientsActivity', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listClientsPastConnections', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getThreatList', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getInternetInfo', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getPortForwardingStatus', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getLanNetworkList', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getLanProfileList', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getWlanGroupList', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSsidList', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSsidDetail', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getFirewallSetting', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getRateLimitProfiles', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('setClientRateLimit', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('setClientRateLimitProfile', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('disableClientRateLimit', expect.any(Object), expect.any(Function));

            // New device tools
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchDetail', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getGatewayDetail', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getGatewayWanStatus', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getGatewayLanStatus', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getGatewayPorts', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApDetail', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApRadios', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getStackPorts', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listPendingDevices', expect.any(Object), expect.any(Function));

            // Security tools
            expect(mockServer.registerTool).toHaveBeenCalledWith('getTopThreats', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listSiteThreatManagement', expect.any(Object), expect.any(Function));

            // Network tools
            expect(mockServer.registerTool).toHaveBeenCalledWith('getWanLanStatus', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listPortForwardingRules', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listAllSsids', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getVpnSettings', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listSiteToSiteVpns', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listOsgAcls', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listEapAcls', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listStaticRoutes', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listRadiusProfiles', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listGroupProfiles', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApplicationControlStatus', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSshSetting', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listTimeRangeProfiles', expect.any(Object), expect.any(Function));

            // Dashboard tools
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDashboardWifiSummary', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDashboardSwitchSummary', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDashboardTrafficActivities', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDashboardPoEUsage', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDashboardTopCpuUsage', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDashboardTopMemoryUsage', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDashboardMostActiveSwitches', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDashboardMostActiveEaps', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDashboardOverview', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getTrafficDistribution', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getRetryAndDroppedRate', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getIspLoad', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getChannels', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getInterference', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getGridDashboardTunnelStats', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getGridDashboardIpsecTunnelStats', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getGridDashboardOpenVpnTunnelStats', expect.any(Object), expect.any(Function));

            // Insight tools
            expect(mockServer.registerTool).toHaveBeenCalledWith('getWids', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getRogueAps', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getVpnTunnelStats', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getIpsecVpnStats', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getWidsBlacklist', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getRoutingTable', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getThreatDetail', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getThreatCount', expect.any(Object), expect.any(Function));

            // Log tools
            expect(mockServer.registerTool).toHaveBeenCalledWith('listSiteEvents', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listSiteAlerts', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listSiteAuditLogs', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listGlobalEvents', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('listGlobalAlerts', expect.any(Object), expect.any(Function));

            // Device read tools (issue #73)
            expect(mockServer.registerTool).toHaveBeenCalledWith('getFirmwareUpgradePlan', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getUpgradePlanList', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getUpgradeLogs', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getGridBatchConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDevicePortConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceLldpNeighbors', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDevicePoEStatus', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDevicePoEConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceLedConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDevicePortMirror', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getPortSchedule', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceStaticIp', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceIsolation', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceTagList', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceCountByType', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceHealthSummary', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceOnlineStatus', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceLocation', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceLog', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceNeighborList', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceUplinkHistory', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceCpuMemStats', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDevicePortStats', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDevicePoePortStats', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceStormControl', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceVlanConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getDeviceStp', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApPoEConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApLedConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApPortMirror', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApChannelConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApBandSteeringConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApBeaconConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApMeshConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApRoamingConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApMacFilterConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApDot1xConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApPpskConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApPortalConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApScheduleConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApRateLimitConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApQosConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApAclConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApGroupConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApMdnsConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApIpv6Config', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApStpConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApMulticastConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApWdsConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApUsageStats', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApRoamHistory', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApAssocHistory', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getApSignalHistory', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchPoEConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchPoEPortConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchStormControl', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchPortMirror', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getLldpMedConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchSpanningTree', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchMacTable', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchArpTable', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchVlanConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchIpv6Config', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchQosPolicy', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchAclConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchRateLimitConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchDhcpSnooping', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchIpSourceGuard', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getSwitchDynamicArpInspection', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getGatewayPoEConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getGatewayPortConfig', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getGatewayWanPortDetail', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getGatewayUsageStats', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getGatewayArpTable', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getGatewayMacTable', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getGatewayIpv6Status', expect.any(Object), expect.any(Function));
            expect(mockServer.registerTool).toHaveBeenCalledWith('getGatewayHaStatus', expect.any(Object), expect.any(Function));

            // Verify total number of tools registered
            expect(mockServer.registerTool).toHaveBeenCalledTimes(274);
        });
    });
});
