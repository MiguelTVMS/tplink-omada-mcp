# Switch Port Tools to Add

Add these tools following existing patterns. All use OpenAPI v1.

## Switch Info (already partially works via genericApiCall)
1. **getSwitch** — GET `/sites/{siteId}/switches/{switchMac}` (v1)
   - Returns full switch info including portList array

## Single Port Operations
2. **setSwitchPortProfile** — PUT `/sites/{siteId}/switches/{switchMac}/ports/{port}/profile`
   - Body: `{"profileId": "string"}` — assigns a LAN profile to the port
3. **setSwitchPortPoe** — PUT `/sites/{siteId}/switches/{switchMac}/ports/{port}/poe-mode`
   - Body: `{"poeMode": number}` — 1=on(802.3at/af), 0=off
4. **setSwitchPortName** — PUT `/sites/{siteId}/switches/{switchMac}/ports/{port}/name`
   - Body: `{"name": "string"}` — 1-128 chars
5. **setSwitchPortStatus** — PUT `/sites/{siteId}/switches/{switchMac}/ports/{port}/status`
   - Body: `{"status": number}` — 0=off, 1=on
6. **setSwitchPortProfileOverride** — PUT `/sites/{siteId}/switches/{switchMac}/ports/{port}/profile-override`
   - Body: `{"profileOverrideEnable": boolean}`

## Batch Port Operations
7. **batchSetSwitchPortProfile** — PUT `/sites/{siteId}/switches/{switchMac}/multi-ports/profile-override`
   - Body: `{"portList": [1,2,3], "profileOverrideEnable": boolean}`
8. **batchSetSwitchPortPoe** — PUT `/sites/{siteId}/switches/{switchMac}/multi-ports/poe-mode`
   - Body: `{"portList": [1,2,3], "poeMode": number}`
9. **batchSetSwitchPortStatus** — PUT `/sites/{siteId}/switches/{switchMac}/multi-ports/status`
   - Body: `{"portList": [1,2,3], "status": number}`
10. **batchSetSwitchPortName** — PUT `/sites/{siteId}/switches/{switchMac}/multi-ports/name`
    - Body: `{"portNameList": [{"port": 1, "name": "Office-Mac"}, ...]}`

## Cable Test
11. **startCableTest** — POST `/sites/{siteId}/cable-test/switches/{switchMac}/start`
12. **getCableTestResults** — GET `/sites/{siteId}/cable-test/switches/{switchMac}/full-results`

## Switch Networks (VLAN trunking)
13. **getSwitchNetworks** — GET `/sites/{siteId}/switches/{switchMac}/networks`
14. **setSwitchNetworks** — POST `/sites/{siteId}/switches/{switchMac}/networks`

## Implementation
- Add methods to a new `SwitchOperations` class in `src/omadaClient/switch.ts`
- Wire into OmadaClient
- Create tool files in `src/tools/`
- Register in `src/tools/index.ts`
- All tools: siteId optional, switchMac required, port required for single-port ops
- Build must pass
- Commit: `feat: add switch port management tools`

## Also: Update README.md
Replace the existing README with a clean one showing:
- Project name: "Omada MCP Server" (not the original repo name)
- Description: Full CRUD MCP server for TP-Link Omada Controller
- Quick start (stdio via node, env vars)
- Docker usage
- Full tool list grouped by category (Read, Write, Actions, Switch Ports, Generic)
- Show the 45 existing + new switch port tools
- Credit original repo as upstream
- Our repo: realtydev/omada-mcp
