# Write Tools to Add

Add write/action tools to this existing MCP server. Follow the existing code patterns exactly (tool registration in src/tools/, operations in src/omadaClient/).

## API Info
- Auth: already handled by AuthManager
- Base path: `buildOmadaPath()` for v1, `buildOmadaPath(path, 'v2')` for v2
- RequestHandler has `.get()` and `.request()` methods
- All write ops use the same `Authorization: AccessToken=xxx` header

## New Tools to Add

### Network Management (write)
1. **createLanNetwork** — POST `/sites/{siteId}/lan-networks` (v2)
   - Params: name, vlan (number), gatewaySubnet (e.g. "192.168.10.1/24"), purpose (1=interface), igmpSnoopEnable (bool), dhcpSettings (enable, ipRangeStart, ipRangeEnd, leaseTime)
   - All fields required by controller validation

2. **updateLanNetwork** — PUT `/sites/{siteId}/lan-networks/{networkId}` (v2)
   - Same fields as create + networkId

3. **deleteLanNetwork** — DELETE `/sites/{siteId}/lan-networks/{networkId}` (v2)

4. **createLanProfile** — POST `/sites/{siteId}/lan-profiles` (v1)
   - Params: name, nativeNetworkId, tagNetworkIds[], poe, spanningTreeEnable, loopbackDetectEnable, portIsolationEnable, lldpMedEnable

5. **updateLanProfile** — PUT `/sites/{siteId}/lan-profiles/{profileId}` (v1)

### Device Actions
6. **rebootDevice** — POST `/sites/{siteId}/devices/{deviceMac}/reboot` (v1) (ref: wonjo-linc/MCP-Omada)
7. **adoptDevice** — POST `/sites/{siteId}/cmd/adopts` body: `{macs: [deviceMac]}` (v1)

### Client Actions
8. **blockClient** — POST `/sites/{siteId}/clients/{clientMac}/block` (v1)
9. **unblockClient** — POST `/sites/{siteId}/clients/{clientMac}/unblock` (v1)

### Firewall
10. **updateFirewallSetting** — PUT `/sites/{siteId}/firewall` (v1)
    - Accepts the same shape returned by getFirewallSetting (broadcastPing, sendRedirects, synCookies, etc.)

### Generic Escape Hatch
11. **genericApiCall** — Execute any Omada API call
    - Params: method (GET/POST/PUT/PATCH/DELETE), path (relative, e.g. "/sites/{siteId}/setting/firewall/acls"), version (v1/v2, default v1), body (optional JSON), queryParams (optional record)
    - This is the power tool for anything not explicitly covered

### Monitoring (read, from wonjo reference)
12. **listEvents** — GET `/sites/{siteId}/events` (v1, paginated)
13. **listLogs** — GET `/sites/{siteId}/logs` (v1, paginated)

### Switch Port Management (from tplink-omada-api reference)
14. **getSwitchPorts** — GET `/sites/{siteId}/switches/{switchMac}/ports` (v1, paginated)
    - Returns all ports with status, profile, PoE, link speed, STP state
15. **updateSwitchPort** — PATCH `/sites/{siteId}/switches/{switchMac}/ports/{portId}` (v1)
    - Params: profileId, poe (enable/disable), bandwidthLimitMode, linkSpeed, duplex, spanningTreeEnable, portIsolationEnable, loopbackDetectEnable, lldpMedEnable

### Client Management
16. **reconnectClient** — POST `/sites/{siteId}/clients/{clientMac}/reconnect` (v1)
17. **updateClient** — PATCH `/sites/{siteId}/clients/{clientMac}` (v1)
    - Params: name (display name), fixedIp (static DHCP), rateLimitEnable, upLimit, downLimit

### Device Management
18. **setDeviceLed** — POST or PATCH `/sites/{siteId}/devices/{deviceMac}/led-setting` (v1)
    - Params: ledSetting (0=off, 1=on, 2=site-default)
19. **getFirmwareDetails** — GET `/sites/{siteId}/devices/{deviceMac}/firmware` (v1)
20. **startFirmwareUpgrade** — POST `/sites/{siteId}/devices/{deviceMac}/firmware/upgrade` (v1)

### Gateway WAN Management
21. **setGatewayWanConnect** — POST `/sites/{siteId}/gateways/{gatewayMac}/wan/{portId}/connect` or `/disconnect` (v1)
    - Params: gatewayMac, portId, action (connect/disconnect)

### Firewall ACL Rules
22. **listFirewallAcls** — GET `/sites/{siteId}/setting/firewall/acls` (v1)
23. **createFirewallAcl** — POST `/sites/{siteId}/setting/firewall/acls` (v1)
    - For inter-VLAN isolation rules
24. **deleteFirewallAcl** — DELETE `/sites/{siteId}/setting/firewall/acls/{aclId}` (v1)

### Static Routes
25. **listRoutes** — GET `/sites/{siteId}/setting/routes` (v1)

NOTE: Some of these endpoint paths are from the older non-OpenAPI style. They may need the path format `/sites/{siteId}/...` under `/openapi/v1/{omadacId}/`. If a call returns 404, try the genericApiCall to discover the correct path. The genericApiCall tool is the safety net.

## Implementation Notes
- Add new operation classes: `ActionOperations` (device/client actions) in `src/omadaClient/action.ts`
- Add write methods to existing `NetworkOperations` in `src/omadaClient/network.ts`
- Add `GenericOperations` in `src/omadaClient/generic.ts`
- Register tools in new files under `src/tools/` following existing patterns
- Wire everything through `OmadaClient` in `src/omadaClient/index.ts`
- Add RequestHandler methods: `.post(path, data, params?)`, `.put(path, data, params?)`, `.delete(path, params?)`
- siteId should be optional on ALL tools (resolved via SiteOperations.resolveSiteId)
- Use zod for input validation (already a dependency)
- Mark write tools with `destructiveHint: true` in annotations
- Build must pass: `npm run build`
